<?php

namespace App\Tests\Unit\Entity;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UserValidationTest extends KernelTestCase
{
    public function testBlankEmailIsInvalid(): void
    {
        self::bootKernel();
        $validator = static::getContainer()->get(ValidatorInterface::class);
        $user = new User();
        $user->setEmail('');
        $user->setNom('Nom');
        $user->setPrenom('Prenom');
        $user->setPassword('hash');
        $errors = $validator->validate($user);
        self::assertGreaterThan(0, $errors->count());
    }

    public function testInvalidEmailFormat(): void
    {
        self::bootKernel();
        $validator = static::getContainer()->get(ValidatorInterface::class);
        $user = new User();
        $user->setEmail('invalid');
        $user->setNom('Nom');
        $user->setPrenom('Prenom');
        $user->setPassword('hash');
        $errors = $validator->validate($user);
        self::assertGreaterThan(0, $errors->count());
    }

    public function testValidUserPassesValidation(): void
    {
        self::bootKernel();
        $validator = static::getContainer()->get(ValidatorInterface::class);
        $user = new User();
        $user->setEmail('ok@example.com');
        $user->setNom('Nom');
        $user->setPrenom('Prenom');
        $user->setPassword('hash');
        $errors = $validator->validate($user);
        self::assertCount(0, $errors);
    }
}
