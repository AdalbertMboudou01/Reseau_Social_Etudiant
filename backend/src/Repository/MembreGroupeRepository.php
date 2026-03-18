<?php

namespace App\Repository;

use App\Entity\MembreGroupe;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<MembreGroupe>
 */
class MembreGroupeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, MembreGroupe::class);
    }

    public function findByEtudiantAndGroupe(int $etudiantId, int $groupeId): ?MembreGroupe
    {
        return $this->createQueryBuilder('mg')
            ->andWhere('mg.etudiant = :etudiantId')
            ->andWhere('mg.groupe = :groupeId')
            ->setParameter('etudiantId', $etudiantId)
            ->setParameter('groupeId', $groupeId)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
