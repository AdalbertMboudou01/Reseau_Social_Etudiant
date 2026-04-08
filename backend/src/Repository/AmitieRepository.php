<?php

namespace App\Repository;

use App\Entity\Amitie;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class AmitieRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Amitie::class);
    }

    public function findFriendship(User $user1, User $user2): ?Amitie
    {
        return $this->createQueryBuilder('a')
            ->where(
                '(a.user1 = :user1 AND a.user2 = :user2) OR (a.user1 = :user2 AND a.user2 = :user1)'
            )
            ->setParameter('user1', $user1)
            ->setParameter('user2', $user2)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findFriends(User $user): array
    {
        return $this->createQueryBuilder('a')
            ->where('(a.user1 = :user OR a.user2 = :user) AND a.statut = :statut')
            ->setParameter('user', $user)
            ->setParameter('statut', 'accepted')
            ->getQuery()
            ->getResult();
    }

    public function countFriends(User $user): int
    {
        return $this->createQueryBuilder('a')
            ->select('COUNT(a.id)')
            ->where('(a.user1 = :user OR a.user2 = :user) AND a.statut = :statut')
            ->setParameter('user', $user)
            ->setParameter('statut', 'accepted')
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function findPendingRequests(User $user): array
    {
        return $this->createQueryBuilder('a')
            ->where('a.user2 = :user AND a.statut = :statut')
            ->setParameter('user', $user)
            ->setParameter('statut', 'pending')
            ->orderBy('a.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findSentRequests(User $user): array
    {
        return $this->createQueryBuilder('a')
            ->where('a.user1 = :user AND a.statut = :statut')
            ->setParameter('user', $user)
            ->setParameter('statut', 'pending')
            ->orderBy('a.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function countPendingRequests(User $user): int
    {
        return $this->createQueryBuilder('a')
            ->select('COUNT(a.id)')
            ->where('a.user2 = :user AND a.statut = :statut')
            ->setParameter('user', $user)
            ->setParameter('statut', 'pending')
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function findSuggestions(User $user, int $limit = 10): array
    {
        $myId = $user->getId();
        if (null === $myId || $myId <= 0) {
            return [];
        }

        $lim = max(1, min(50, $limit));

        // Tout en SQL PostgreSQL (tables réelles) : évite NOT IN + tableau en DQL
        // (souvent source de 500 selon la version Doctrine / le driver).
        $conn = $this->getEntityManager()->getConnection();
        $sql = <<<SQL
            SELECT u.id
            FROM "user" u
            WHERE u.id <> :mid
              AND u.id NOT IN (
                SELECT a.user2_id FROM amitie a WHERE a.user1_id = :mid_a
                UNION
                SELECT a.user1_id FROM amitie a WHERE a.user2_id = :mid_b
              )
            ORDER BY u.id DESC
            LIMIT {$lim}
            SQL;

        $result = $conn->executeQuery($sql, [
            'mid' => $myId,
            'mid_a' => $myId,
            'mid_b' => $myId,
        ]);

        $ids = array_map(intval(...), $result->fetchFirstColumn());
        if ($ids === []) {
            return [];
        }

        $em = $this->getEntityManager();
        $users = [];
        foreach ($ids as $id) {
            if ($id <= 0) {
                continue;
            }
            $candidate = $em->find(User::class, $id);
            if (null !== $candidate) {
                $users[] = $candidate;
            }
        }

        return $users;
    }
}
