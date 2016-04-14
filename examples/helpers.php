<?php



class Db {

    /** @var int */
    private $pages;

    /** @var int */
    private $pageSize;

    /** @var int */
    private $currentPage;

    /** @var array */
    private $items;


    public function __construct($pages, $pageSize) {
        $this->pages = $pages;
        $this->pageSize = $pageSize;
        $this->generateItems();

    }


    public function setCurrentPage($page) {
        if ($page < 1 || $page > $this->pages) {
            throw new RangeException("Invalid page number");

        }

        $this->currentPage = $page;
        return $this;

    }


    public function getItemsAtPage() {
        return array_slice($this->items, ($this->currentPage - 1) * $this->pageSize, $this->pageSize);

    }


    public function getAllItems() {
        return $this->items;

    }

    public function getPageNumbers() {
        return range(1, $this->pages);
        
    }

    private function generateItems() {
        $this->items = array_map(function($id) {
            return (object) ['id' => $id];
        }, range(1, $this->pages * $this->pageSize));
    }

}


class Helpers {

    public static function isAjax() {
        return !empty($_SERVER['HTTP_X_REQUESTED_WITH']);
    }

    public static function sendJson(array $data) {
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;

    }

    public static function escapeHtml($input) {
        return htmlspecialchars($input, ENT_QUOTES);

    }

}


function e($s) {
    return Helpers::escapeHtml($s);
}
