<?php
require 'vendor/autoload.php';

use HabboAPI\HabboAPI;
use HabboAPI\HabboParser;

header('Content-Type: application/json');  

$habboParser = new HabboParser('com');
$habboApi = new HabboAPI($habboParser);

$username = isset($_GET['username']) ? $_GET['username'] : 'defaultUser';

try {
    $habbo = $habboApi->getHabbo($username);
    $profile = $habboApi->getProfile($habbo->getId());

    $lastAccessTime = $habbo->getLastAccessTime();
    $currentTime = new DateTime();
    $onlineTime = $habbo->isOnline() ? $lastAccessTime->diff($currentTime)->format('%h hours, %i minutes, %s seconds') : "Offline";

    $badges = array_map(function ($badge) {
        return [
            'name' => $badge->getName(),
            'code' => $badge->getCode()
        ];
    }, $habbo->getSelectedBadges());

    $response = [
        'username' => $habbo->getHabboName(),
        'motto' => $habbo->getMotto(),
        'figureString' => $habbo->getFigureString(),
        'memberSince' => $habbo->getMemberSince()->format('Y-m-d'),
        'lastAccessTime' => $lastAccessTime->format('Y-m-d H:i:s'),
        'onlineTime' => $onlineTime,
        'online' => $habbo->isOnline() ? 'Yes' : 'No',
        'badges' => $badges,
        'currentLevel' => $habbo->getCurrentLevel(),
        'levelCompletion' => $habbo->getCurrentLevelCompleted(),
        'totalExperience' => $habbo->getTotalExperience(),
        'starGemCount' => $habbo->getStarGemCount()
    ];

    echo json_encode($response);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
