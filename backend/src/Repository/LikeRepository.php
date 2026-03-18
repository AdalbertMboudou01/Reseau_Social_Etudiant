<?php

namespace App\Repository;

use App\Entity\Like;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Like>
 */
class LikeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Like::class);
    }

    public function findByUserAndPublication(int $userId, int $publicationId): ?Like
    {
        return $this->createQueryBuilder('l')
            ->andWhere('l.user = :userId')
            ->andWhere('l.publication = :publicationId')
            ->setParameter('userId', $userId)
            ->setParameter('publicationId', $publicationId)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
