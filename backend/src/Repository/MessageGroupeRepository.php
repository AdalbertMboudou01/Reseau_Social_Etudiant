<?php

namespace App\Repository;

use App\Entity\MessageGroupe;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<MessageGroupe>
 */
class MessageGroupeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, MessageGroupe::class);
    }

    public function findByGroupeOrderedByDate($groupeId): array
    {
        return $this->createQueryBuilder('m')
            ->join('m.auteur', 'a')
            ->join('m.groupe', 'g')
            ->where('g.id = :groupeId')
            ->setParameter('groupeId', $groupeId)
            ->orderBy('m.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    //    /**
    //     * @return MessageGroupe[] Returns an array of MessageGroupe objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //     * @return MessageGroupe[] Returns an array of MessageGroupe objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('m')
    //            ->andWhere('m.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('m.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?MessageGroupe
    //    {
    //        return $this->createQueryBuilder('m')
    //            ->andWhere('m.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}