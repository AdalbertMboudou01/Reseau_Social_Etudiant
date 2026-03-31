<?php

namespace App\Controller;

use App\Repository\UserRepository;
use App\Repository\PublicationRepository;
use App\Repository\GroupeRepository;
use App\Repository\CoursRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Doctrine\ORM\EntityManagerInterface;

#[Route('/api/search')]
class SearchController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private PublicationRepository $publicationRepository,
        private GroupeRepository $groupeRepository,
        private CoursRepository $coursRepository,
        private EntityManagerInterface $em
    ) {
    }

    #[Route('', name: 'api_search_global', methods: ['GET'])]
    public function search(Request $request): JsonResponse
    {
        $query = $request->query->get('q', '');
        $type = $request->query->get('type', 'all'); // all, users, publications, groupes, cours

        if (strlen($query) < 2) {
            return $this->json([
                'query' => $query,
                'results' => []
            ]);
        }

        $results = [];

        // Search users
        if ($type === 'all' || $type === 'users') {
            $users = $this->userRepository->createQueryBuilder('u')
                ->where('u.prenom LIKE :q OR u.nom LIKE :q OR u.email LIKE :q')
                ->setParameter('q', "%{$query}%")
                ->setMaxResults(10)
                ->getQuery()
                ->getResult();

            $results['users'] = array_map(fn($user) => [
                'id' => $user->getId(),
                'prenom' => $user->getPrenom(),
                'nom' => $user->getNom(),
                'email' => $user->getEmail(),
                'photo' => $user->getPhoto(),
                'universite' => $user->getUniversite(),
                'type' => 'user',
            ], $users);
        }

        // Search publications
        if ($type === 'all' || $type === 'publications') {
            $publications = $this->publicationRepository->createQueryBuilder('p')
                ->where('p.contenu LIKE :q')
                ->setParameter('q', "%{$query}%")
                ->orderBy('p.createdAt', 'DESC')
                ->setMaxResults(10)
                ->getQuery()
                ->getResult();

            $results['publications'] = array_map(fn($pub) => [
                'id' => $pub->getId(),
                'contenu' => substr($pub->getContenu(), 0, 150),
                'image' => $pub->getImage(),
                'auteur' => [
                    'id' => $pub->getAuteur()->getId(),
                    'prenom' => $pub->getAuteur()->getPrenom(),
                    'nom' => $pub->getAuteur()->getNom(),
                    'photo' => $pub->getAuteur()->getPhoto(),
                ],
                'createdAt' => $pub->getCreatedAt()?->format('Y-m-d H:i:s'),
                'type' => 'publication',
            ], $publications);
        }

        // Search groupes
        if ($type === 'all' || $type === 'groupes') {
            $groupes = $this->groupeRepository->createQueryBuilder('g')
                ->where('g.nom LIKE :q OR g.description LIKE :q')
                ->setParameter('q', "%{$query}%")
                ->setMaxResults(10)
                ->getQuery()
                ->getResult();

            $results['groupes'] = array_map(fn($groupe) => [
                'id' => $groupe->getId(),
                'nom' => $groupe->getNom(),
                'description' => substr($groupe->getDescription(), 0, 150),
                'membersCount' => count($groupe->getMembres()),
                'createur' => [
                    'id' => $groupe->getCreateur()->getId(),
                    'prenom' => $groupe->getCreateur()->getPrenom(),
                    'nom' => $groupe->getCreateur()->getNom(),
                ],
                'createdAt' => $groupe->getCreatedAt()?->format('Y-m-d H:i:s'),
                'type' => 'groupe',
            ], $groupes);
        }

        // Search cours
        if ($type === 'all' || $type === 'cours') {
            $cours = $this->coursRepository->createQueryBuilder('c')
                ->where('c.titre LIKE :q OR c.description LIKE :q')
                ->setParameter('q', "%{$query}%")
                ->orderBy('c.createdAt', 'DESC')
                ->setMaxResults(10)
                ->getQuery()
                ->getResult();

            $results['cours'] = array_map(fn($c) => [
                'id' => $c->getId(),
                'titre' => $c->getTitre(),
                'description' => substr($c->getDescription(), 0, 150),
                'auteur' => [
                    'id' => $c->getAuteur()->getId(),
                    'prenom' => $c->getAuteur()->getPrenom(),
                    'nom' => $c->getAuteur()->getNom(),
                    'photo' => $c->getAuteur()->getPhoto(),
                ],
                'public' => $c->isPublic(),
                'createdAt' => $c->getCreatedAt()?->format('Y-m-d H:i:s'),
                'type' => 'cours',
            ], $cours);
        }

        return $this->json([
            'query' => $query,
            'results' => $results,
        ]);
    }

    #[Route('/suggestions', name: 'api_search_suggestions', methods: ['GET'])]
    public function getSuggestions(Request $request): JsonResponse
    {
        $query = $request->query->get('q', '');

        if (strlen($query) < 1) {
            return $this->json([]);
        }

        $suggestions = [];

        // User suggestions
        $users = $this->userRepository->createQueryBuilder('u')
            ->where('u.prenom LIKE :q OR u.nom LIKE :q')
            ->setParameter('q', "{$query}%")
            ->setMaxResults(5)
            ->getQuery()
            ->getResult();

        foreach ($users as $user) {
            $suggestions[] = [
                'id' => $user->getId(),
                'text' => "{$user->getPrenom()} {$user->getNom()}",
                'type' => 'user',
                'icon' => '👤',
            ];
        }

        // Groupe suggestions
        $groupes = $this->groupeRepository->createQueryBuilder('g')
            ->where('g.nom LIKE :q')
            ->setParameter('q', "{$query}%")
            ->setMaxResults(3)
            ->getQuery()
            ->getResult();

        foreach ($groupes as $groupe) {
            $suggestions[] = [
                'id' => $groupe->getId(),
                'text' => $groupe->getNom(),
                'type' => 'groupe',
                'icon' => '📁',
            ];
        }

        // Cours suggestions
        $cours = $this->coursRepository->createQueryBuilder('c')
            ->where('c.titre LIKE :q')
            ->setParameter('q', "{$query}%")
            ->setMaxResults(3)
            ->getQuery()
            ->getResult();

        foreach ($cours as $c) {
            $suggestions[] = [
                'id' => $c->getId(),
                'text' => $c->getTitre(),
                'type' => 'cours',
                'icon' => '📚',
            ];
        }

        return $this->json($suggestions);
    }
}
