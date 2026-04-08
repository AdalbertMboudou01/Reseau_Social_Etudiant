<?php

namespace App\Repository;

use App\Entity\Publication;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Publication>
 */
class PublicationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Publication::class);
    }

    /**
     * @return Publication[]
     */
    public function findAllOrderedByDate(int $page = 1, int $limit = 10): array
    {
        $offset = max(0, ($page - 1) * $limit);

        return $this->createQueryBuilder('p')
            ->leftJoin('p.auteur', 'a')
            ->addSelect('a')
            ->orderBy('p.createdAt', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function countAll(): int
    {
        return (int) $this->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * @return Publication[]
     */
    public function findByAuteur(int $auteurId): array
    {
        return $this->createQueryBuilder('p')
            ->leftJoin('p.auteur', 'a')
            ->addSelect('a')
            ->andWhere('p.auteur = :auteurId')
            ->setParameter('auteurId', $auteurId)
            ->orderBy('p.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
