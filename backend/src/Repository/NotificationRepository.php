<?php

namespace App\Repository;

use App\Entity\Notification;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class NotificationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Notification::class);
    }

    public function findByUtilisateur(User $user, int $limit = 50): array
    {
        return $this->createQueryBuilder('n')
            ->leftJoin('n.auteur', 'a')
            ->addSelect('a')
            ->where('n.utilisateur = :user')
            ->setParameter('user', $user)
            ->orderBy('n.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function countUnread(User $user): int
    {
        return $this->createQueryBuilder('n')
            ->select('COUNT(n.id)')
            ->where('n.utilisateur = :user AND n.lue = false')
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function findUnread(User $user, int $limit = 20): array
    {
        return $this->createQueryBuilder('n')
            ->leftJoin('n.auteur', 'a')
            ->addSelect('a')
            ->where('n.utilisateur = :user AND n.lue = false')
            ->setParameter('user', $user)
            ->orderBy('n.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function markAsRead(Notification $notification): void
    {
        $notification->setLue(true);
        $notification->setReadAt(new \DateTimeImmutable());
        $this->getEntityManager()->flush();
    }

    public function markAllAsRead(User $user): void
    {
        $this->createQueryBuilder('n')
            ->update()
            ->set('n.lue', true)
            ->set('n.readAt', ':now')
            ->where('n.utilisateur = :user')
            ->where('n.lue = false')
            ->setParameter('user', $user)
            ->setParameter('now', new \DateTimeImmutable())
            ->getQuery()
            ->execute();
    }
}
