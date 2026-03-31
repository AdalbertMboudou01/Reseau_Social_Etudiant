<?php

namespace App\Entity;

use App\Repository\InscriptionEvenementRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: InscriptionEvenementRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_USER_EVENT', columns: ['utilisateur_id', 'evenement_id'])]
class InscriptionEvenement
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private User $utilisateur;

    #[ORM\ManyToOne(targetEntity: Evenement::class, inversedBy: 'inscriptions')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Evenement $evenement;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private ?\DateTimeImmutable $dateInscription = null;

    #[ORM\Column(type: Types::BOOLEAN)]
    private bool $estPresent = false;

    public function __construct()
    {
        $this->dateInscription = new \DateTimeImmutable();
        $this->estPresent = false;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUtilisateur(): User
    {
        return $this->utilisateur;
    }

    public function setUtilisateur(User $utilisateur): self
    {
        $this->utilisateur = $utilisateur;
        return $this;
    }

    public function getEvenement(): Evenement
    {
        return $this->evenement;
    }

    public function setEvenement(Evenement $evenement): self
    {
        $this->evenement = $evenement;
        return $this;
    }

    public function getDateInscription(): ?\DateTimeImmutable
    {
        return $this->dateInscription;
    }

    public function setDateInscription(\DateTimeImmutable $dateInscription): self
    {
        $this->dateInscription = $dateInscription;
        return $this;
    }

    public function isEstPresent(): bool
    {
        return $this->estPresent;
    }

    public function setEstPresent(bool $estPresent): self
    {
        $this->estPresent = $estPresent;
        return $this;
    }
}
