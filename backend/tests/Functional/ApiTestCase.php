<?php

namespace App\Tests\Functional;

use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

abstract class ApiTestCase extends WebTestCase
{
    protected KernelBrowser $client;

    protected function setUp(): void
    {
        parent::setUp();
        $this->client = static::createClient();
        $this->resetDatabase();
    }

    protected function resetDatabase(): void
    {
        $em = static::getContainer()->get('doctrine')->getManager();
        $meta = $em->getMetadataFactory()->getAllMetadata();
        $tool = new SchemaTool($em);
        $tool->dropSchema($meta);
        $tool->createSchema($meta);
    }

    protected function jsonRequest(string $method, string $uri, ?array $data = null, array $headers = []): void
    {
        $server = array_merge([
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
        ], $headers);
        $body = null !== $data ? json_encode($data) : null;
        $this->client->request($method, $uri, [], [], $server, $body);
    }

    protected function authHeaders(string $token): array
    {
        return ['HTTP_AUTHORIZATION' => 'Bearer '.$token];
    }

    protected function registerAndLogin(string $email = 'test@example.com', string $password = 'secret12'): string
    {
        $this->jsonRequest('POST', '/api/register', [
            'email' => $email,
            'password' => $password,
            'nom' => 'Dupont',
            'prenom' => 'Jean',
        ]);
        self::assertResponseStatusCodeSame(201);

        $this->jsonRequest('POST', '/api/login', [
            'email' => $email,
            'password' => $password,
        ]);
        self::assertResponseStatusCodeSame(200);
        $payload = json_decode($this->client->getResponse()->getContent(), true);
        self::assertArrayHasKey('token', $payload);

        return $payload['token'];
    }
}
