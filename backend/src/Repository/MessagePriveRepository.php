<?php

namespace App\Repository;

use App\Entity\MessagePrive;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<MessagePrive>
 */
class MessagePriveRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, MessagePrive::class);
    }

    /**
     * Récupère une conversation entre deux utilisateurs (triée par date)
     */
    public function findConversation(User $user1, User $user2): array
    {
        return $this->createQueryBuilder('m')
            ->where(
                '(m.expediteur = :user1 AND m.destinataire = :user2) OR ' .
                '(m.expediteur = :user2 AND m.destinataire = :user1)'
            )
            ->setParameter('user1', $user1)
            ->setParameter('user2', $user2)
            ->orderBy('m.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Récupère la liste des conversations d'un utilisateur (dernier message de chaque)
     */
    public function findConversationsForUser(User $user): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.expediteur = :user OR m.destinataire = :user')
            ->setParameter('user', $user)
            ->orderBy('m.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Compte les messages non lus pour un utilisateur
     */
    public function countUnreadMessages(User $user): int
    {
        return $this->createQueryBuilder('m')
            ->select('COUNT(m.id)')
            ->where('m.destinataire = :user AND m.luParDestinataire = false')
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Marque les messages comme lus
     */
    public function markAsRead(User $expediteur, User $destinataire): void
    {
        $this->createQueryBuilder('m')
            ->update()
            ->set('m.luParDestinataire', 'true')
            ->where('m.expediteur = :expediteur AND m.destinataire = :destinataire')
            ->setParameter('expediteur', $expediteur)
            ->setParameter('destinataire', $destinataire)
            ->getQuery()
            ->execute();
    }
}
