<?php

namespace App\Command;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-admin',
    description: 'Créer un utilisateur administrateur',
)]
class CreateAdminCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::REQUIRED, 'Email de l\'administrateur')
            ->addArgument('password', InputArgument::REQUIRED, 'Mot de passe de l\'administrateur')
            ->addArgument('nom', InputArgument::REQUIRED, 'Nom de l\'administrateur')
            ->addArgument('prenom', InputArgument::REQUIRED, 'Prénom de l\'administrateur')
            ->addOption('force', null, InputOption::VALUE_NONE, 'Forcer la création même si un admin existe déjà')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $email = $input->getArgument('email');
        $password = $input->getArgument('password');
        $nom = $input->getArgument('nom');
        $prenom = $input->getArgument('prenom');
        $force = $input->getOption('force');

        // Vérifier si un admin existe déjà
        $adminRepo = $this->entityManager->getRepository(User::class);
        $existingAdmins = $adminRepo->findAll();
        $existingAdmin = null;
        
        foreach ($existingAdmins as $user) {
            if (in_array('ROLE_ADMIN', $user->getRoles())) {
                $existingAdmin = $user;
                break;
            }
        }

        if ($existingAdmin && !$force) {
            $io->error('Un administrateur existe déjà. Utilisez --force pour en créer un autre.');
            return Command::FAILURE;
        }

        // Vérifier si l'email existe déjà
        $existingUser = $adminRepo->findOneBy(['email' => $email]);
        if ($existingUser) {
            $io->error('Un utilisateur avec cet email existe déjà.');
            return Command::FAILURE;
        }

        // Créer l'administrateur
        $admin = new User();
        $admin->setEmail($email);
        $admin->setNom($nom);
        $admin->setPrenom($prenom);
        $admin->setRoles(['ROLE_ADMIN', 'ROLE_ETUDIANT']);
        $admin->setIsActive(true);

        // Hasher le mot de passe
        $hashedPassword = $this->passwordHasher->hashPassword($admin, $password);
        $admin->setPassword($hashedPassword);

        $this->entityManager->persist($admin);
        $this->entityManager->flush();

        $io->success([
            'Administrateur créé avec succès !',
            sprintf('Email: %s', $email),
            sprintf('Nom: %s %s', $prenom, $nom),
            'Rôles: ROLE_ADMIN, ROLE_ETUDIANT'
        ]);

        return Command::SUCCESS;
    }
}
