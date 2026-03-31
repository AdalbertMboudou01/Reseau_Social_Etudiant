<?php

namespace App\Repository;

use App\Entity\Evenement;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query\Expr\Comparison;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Evenement>
 */
class EvenementRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Evenement::class);
    }

    public function findUpcoming(int $limit = 20)
    {
        return $this->createQueryBuilder('e')
            ->where('e.dateDebut >= :now')
            ->setParameter('now', new \DateTimeImmutable())
            ->orderBy('e.dateDebut', 'ASC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function findByMonth(int $year, int $month)
    {
        $startDate = new \DateTimeImmutable(sprintf('%04d-%02d-01', $year, $month));
        $endDate = $startDate->modify('last day of this month')->modify('23:59:59');

        return $this->createQueryBuilder('e')
            ->where('e.dateDebut >= :start AND e.dateDebut <= :end')
            ->setParameter('start', $startDate)
            ->setParameter('end', $endDate)
            ->orderBy('e.dateDebut', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByDateRange(\DateTimeImmutable $start, \DateTimeImmutable $end)
    {
        return $this->createQueryBuilder('e')
            ->where('e.dateDebut >= :start AND e.dateDebut <= :end')
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->orderBy('e.dateDebut', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByCreateur(User $user, int $limit = 50)
    {
        return $this->createQueryBuilder('e')
            ->where('e.createur = :creator')
            ->setParameter('creator', $user)
            ->orderBy('e.dateDebut', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function findByType(string $type, int $limit = 20)
    {
        return $this->createQueryBuilder('e')
            ->where('e.type = :type')
            ->setParameter('type', $type)
            ->orderBy('e.dateDebut', 'ASC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function findByGroupe(int $groupeId)
    {
        return $this->createQueryBuilder('e')
            ->where('e.groupe = :groupe')
            ->setParameter('groupe', $groupeId)
            ->orderBy('e.dateDebut', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
