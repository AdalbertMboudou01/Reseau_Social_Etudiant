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
        // Récupère les IDs de tous les utilisateurs avec une relation existante
        // (peu importe le statut: amis acceptés, demandes envoyées/reçues, etc.)
        $connectedUserIds = $this->createQueryBuilder('a')
            ->select('DISTINCT CASE 
                WHEN a.user1 = :user THEN a.user2
                WHEN a.user2 = :user THEN a.user1
            END as userId')
            ->where('a.user1 = :user OR a.user2 = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getArrayResult();

        // Extrait les IDs
        $connectedIds = array_map(fn($row) => $row['userId'], $connectedUserIds);
        $connectedIds[] = $user->getId(); // Ajoute l'utilisateur courant

        // Récupère les utilisateurs sans relations avec l'utilisateur courant
        $qb = $this->_em->createQueryBuilder();
        return $qb
            ->select('u')
            ->from('App\Entity\User', 'u')
            ->where('u.id NOT IN (:excludeIds)')
            ->setParameter('excludeIds', $connectedIds ?: [0]) // [0] si liste vide
            ->orderBy('u.id', 'DESC') // Pour varier les suggestions
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}
