<?php

namespace App\Repository;

use App\Entity\InscriptionEvenement;
use App\Entity\User;
use App\Entity\Evenement;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<InscriptionEvenement>
 */
class InscriptionEvenementRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, InscriptionEvenement::class);
    }

    public function findByUtilisateur(User $user)
    {
        return $this->createQueryBuilder('i')
            ->where('i.utilisateur = :user')
            ->setParameter('user', $user)
            ->orderBy('i.evenement.dateDebut', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByEvenement(Evenement $evenement)
    {
        return $this->createQueryBuilder('i')
            ->where('i.evenement = :event')
            ->setParameter('event', $evenement)
            ->orderBy('i.dateInscription', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findByUtilisateurAndEvenement(User $user, Evenement $evenement): ?InscriptionEvenement
    {
        return $this->createQueryBuilder('i')
            ->where('i.utilisateur = :user AND i.evenement = :event')
            ->setParameter('user', $user)
            ->setParameter('event', $evenement)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findAllForUtilisateur(User $user, int $limit = 100): array
    {
        return $this->createQueryBuilder('i')
            ->join('i.evenement', 'e')
            ->where('i.utilisateur = :user')
            ->setParameter('user', $user)
            ->orderBy('e.dateDebut', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function findUpcomingForUtilisateur(User $user, int $limit = 20)
    {
        return $this->createQueryBuilder('i')
            ->join('i.evenement', 'e')
            ->where('i.utilisateur = :user AND e.dateDebut >= :now')
            ->setParameter('user', $user)
            ->setParameter('now', new \DateTimeImmutable())
            ->orderBy('e.dateDebut', 'ASC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function countByEvenement(Evenement $evenement): int
    {
        return (int) $this->createQueryBuilder('i')
            ->select('COUNT(i.id)')
            ->where('i.evenement = :event')
            ->setParameter('event', $evenement)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
