<?php

namespace App\Controller;

use App\Entity\Evenement;
use App\Entity\InscriptionEvenement;
use App\Entity\User;
use App\Repository\EvenementRepository;
use App\Repository\InscriptionEvenementRepository;
use App\Repository\GroupeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/evenements')]
class EvenementController extends AbstractController
{
    #[Route('', name: 'api_evenements_list', methods: ['GET'])]
    public function index(EvenementRepository $repo, Request $request): JsonResponse
    {
        $filter = $request->query->get('filter', 'upcoming'); // upcoming, past, all, byMonth
        $month = $request->query->get('month');
        $year = $request->query->get('year');
        $type = $request->query->get('type');

        $evenements = [];

        if ($filter === 'byMonth' && $month && $year) {
            $evenements = $repo->findByMonth((int)$year, (int)$month);
        } elseif ($filter === 'byType' && $type) {
            $evenements = $repo->findByType($type);
        } else {
            $evenements = $repo->findUpcoming(50);
        }

        $data = array_map(fn(Evenement $e) => [
            'id' => $e->getId(),
            'titre' => $e->getTitre(),
            'description' => $e->getDescription(),
            'dateDebut' => $e->getDateDebut() ? $e->getDateDebut()->format('c') : null,
            'dateFin' => $e->getDateFin() ? $e->getDateFin()->format('c') : null,
            'lieu' => $e->getLieu(),
            'type' => $e->getType(),
            'capaciteMax' => $e->getCapaciteMax(),
            'nombreInscrits' => $e->getNombreInscrits(),
            'estPlein' => $e->isPlein(),
            'createur' => [
                'id' => $e->getCreateur()->getId(),
                'prenom' => $e->getCreateur()->getPrenom(),
                'nom' => $e->getCreateur()->getNom(),
                'photo' => $e->getCreateur()->getPhoto(),
            ],
            'groupe' => $e->getGroupe() ? [
                'id' => $e->getGroupe()->getId(),
                'nom' => $e->getGroupe()->getNom(),
            ] : null,
            'createdAt' => $e->getCreatedAt() ? $e->getCreatedAt()->format('c') : null,
        ], $evenements);

        return $this->json($data);
    }

    #[Route('', name: 'api_evenements_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        ValidatorInterface $validator,
        GroupeRepository $groupeRepo
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);

        $evenement = new Evenement();
        $evenement->setTitre($data['titre'] ?? '');
        $evenement->setDescription($data['description'] ?? '');
        $evenement->setLieu($data['lieu'] ?? '');
        $evenement->setType($data['type'] ?? 'autre');
        $evenement->setCreateur($user);

        if (isset($data['dateDebut'])) {
            $evenement->setDateDebut(new \DateTimeImmutable($data['dateDebut']));
        }
        if (isset($data['dateFin'])) {
            $evenement->setDateFin(new \DateTimeImmutable($data['dateFin']));
        }
        if (isset($data['capaciteMax'])) {
            $evenement->setCapaciteMax((int)$data['capaciteMax']);
        }
        if (isset($data['groupeId'])) {
            $groupe = $groupeRepo->find($data['groupeId']);
            if ($groupe) {
                $evenement->setGroupe($groupe);
            }
        }

        $errors = $validator->validate($evenement);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $em->persist($evenement);
        $em->flush();

        return $this->json([
            'id' => $evenement->getId(),
            'message' => 'Événement crée',
        ], 201);
    }

    #[Route('/mois-inscriptions', name: 'api_evenements_my_inscriptions', methods: ['GET'])]
    public function getMyInscriptions(InscriptionEvenementRepository $inscRepo): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $inscriptions = $inscRepo->findAllForUtilisateur($user, 100);

        $data = array_map(fn(InscriptionEvenement $i) => [
            'id' => $i->getEvenement()->getId(),
            'titre' => $i->getEvenement()->getTitre(),
            'dateDebut' => $i->getEvenement()->getDateDebut() ? $i->getEvenement()->getDateDebut()->format('c') : null,
            'dateFin' => $i->getEvenement()->getDateFin() ? $i->getEvenement()->getDateFin()->format('c') : null,
            'lieu' => $i->getEvenement()->getLieu(),
            'type' => $i->getEvenement()->getType(),
            'nombreInscrits' => $i->getEvenement()->getNombreInscrits(),
            'capaciteMax' => $i->getEvenement()->getCapaciteMax(),
            'createur' => [
                'id' => $i->getEvenement()->getCreateur()->getId(),
                'prenom' => $i->getEvenement()->getCreateur()->getPrenom(),
                'nom' => $i->getEvenement()->getCreateur()->getNom(),
            ],
        ], $inscriptions);

        return $this->json($data);
    }

    #[Route('/{id}', name: 'api_evenements_show', methods: ['GET'])]
    public function show(Evenement $evenement, InscriptionEvenementRepository $inscRepo): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $userInscription = $inscRepo->findByUtilisateurAndEvenement($user, $evenement);

        return $this->json([
            'id' => $evenement->getId(),
            'titre' => $evenement->getTitre(),
            'description' => $evenement->getDescription(),
            'dateDebut' => $evenement->getDateDebut() ? $evenement->getDateDebut()->format('c') : null,
            'dateFin' => $evenement->getDateFin() ? $evenement->getDateFin()->format('c') : null,
            'lieu' => $evenement->getLieu(),
            'type' => $evenement->getType(),
            'capaciteMax' => $evenement->getCapaciteMax(),
            'nombreInscrits' => $evenement->getNombreInscrits(),
            'estPlein' => $evenement->isPlein(),
            'estInscrit' => $userInscription !== null,
            'createur' => [
                'id' => $evenement->getCreateur()->getId(),
                'prenom' => $evenement->getCreateur()->getPrenom(),
                'nom' => $evenement->getCreateur()->getNom(),
                'photo' => $evenement->getCreateur()->getPhoto(),
                'email' => $evenement->getCreateur()->getEmail(),
            ],
            'groupe' => $evenement->getGroupe() ? [
                'id' => $evenement->getGroupe()->getId(),
                'nom' => $evenement->getGroupe()->getNom(),
            ] : null,
            'createdAt' => $evenement->getCreatedAt() ? $evenement->getCreatedAt()->format('c') : null,
        ]);
    }

    #[Route('/{id}', name: 'api_evenements_update', methods: ['PUT'])]
    public function update(
        Evenement $evenement,
        Request $request,
        EntityManagerInterface $em,
        ValidatorInterface $validator
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        if ($evenement->getCreateur()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Vous ne pouvez pas modifier cet événement'], 403);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['titre'])) $evenement->setTitre($data['titre']);
        if (isset($data['description'])) $evenement->setDescription($data['description']);
        if (isset($data['lieu'])) $evenement->setLieu($data['lieu']);
        if (isset($data['type'])) $evenement->setType($data['type']);
        if (isset($data['dateDebut'])) $evenement->setDateDebut(new \DateTimeImmutable($data['dateDebut']));
        if (isset($data['dateFin'])) $evenement->setDateFin(new \DateTimeImmutable($data['dateFin']));
        if (isset($data['capaciteMax'])) $evenement->setCapaciteMax((int)$data['capaciteMax']);

        $evenement->setUpdatedAt(new \DateTimeImmutable());

        $errors = $validator->validate($evenement);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $em->flush();

        return $this->json(['message' => 'Événement modifié']);
    }

    #[Route('/{id}', name: 'api_evenements_delete', methods: ['DELETE'])]
    public function delete(Evenement $evenement, EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        if ($evenement->getCreateur()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Vous ne pouvez pas supprimer cet événement'], 403);
        }

        $em->remove($evenement);
        $em->flush();

        return $this->json(['message' => 'Événement supprimé']);
    }

    #[Route('/{id}/inscrire', name: 'api_evenements_register', methods: ['POST'])]
    public function inscrire(
        Evenement $evenement,
        EntityManagerInterface $em,
        InscriptionEvenementRepository $inscRepo
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        // Check if already inscribed
        $existing = $inscRepo->findByUtilisateurAndEvenement($user, $evenement);
        if ($existing) {
            return $this->json(['error' => 'Vous êtes déjà inscrit à cet événement'], 400);
        }

        // Check capacity
        if ($evenement->isPlein()) {
            return $this->json(['error' => 'L\'événement est complet'], 400);
        }

        try {
            $inscription = new InscriptionEvenement();
            $inscription->setUtilisateur($user);
            $inscription->setEvenement($evenement);
            $inscription->setDateInscription(new \DateTimeImmutable());
            $inscription->setEstPresent(false);
            
            $evenement->addInscription($inscription);

            $em->persist($inscription);
            $em->flush();

            return $this->json([
                'message' => 'Inscrit à l\'événement',
                'nombreInscrits' => $evenement->getNombreInscrits(),
            ], 201);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de l\'inscription: ' . $e->getMessage()], 500);
        }
    }

    #[Route('/{id}/quitter', name: 'api_evenements_unregister', methods: ['POST'])]
    public function quitter(
        Evenement $evenement,
        EntityManagerInterface $em,
        InscriptionEvenementRepository $inscRepo
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $inscription = $inscRepo->findByUtilisateurAndEvenement($user, $evenement);
        if (!$inscription) {
            return $this->json(['error' => 'Vous n\'êtes pas inscrit à cet événement'], 400);
        }

        try {
            $evenement->removeInscription($inscription);
            $em->remove($inscription);
            $em->flush();

            return $this->json([
                'message' => 'Inscription annulée',
                'nombreInscrits' => $evenement->getNombreInscrits(),
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de la désinscription: ' . $e->getMessage()], 500);
        }
    }
}
