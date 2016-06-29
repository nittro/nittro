<?php


/**
 * This is an example of how loading items on demand when the user scrolls works with the Nittro Paginator.
 *
 * On the backend, if we don't get an AJAX request, we render the current page as usual; when we do receive
 * an AJAX request though, we return the raw items in the response instead.
 *
 * On the frontend, we should at first render the usual UI that would work even without any JS enhancements
 *  - but more importantly it will work for search engines. Then we initialise the widget and hide the now
 * useless pagination links at the bottom of the page.
 */

require_once __DIR__ . '/helpers.php';


$pages = 15;
$pageSize = 40;
$db = new Db($pages, $pageSize);


$page = isset($_GET['p']) ? (int) $_GET['p'] : 1;


try {
    $db->setCurrentPage($page);

} catch (RangeException $e) {
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit;

}

$items = $db->getItemsAtPage();


if (Helpers::isAjax()) {
    Helpers::sendJson(['items' => $items]);

}

?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Nittro Paginator widget example</title>

        <script type="application/json" id="nittro-params">
            {
                "basePath": "/examples",
                "page": {
                    "whitelistLinks": true
                }
            }
        </script>

        <script type="text/javascript">window._stack = [];</script>

        <link rel="stylesheet" type="text/css" href="../dist/css/nittro.full.css" />
    </head>
    <body>
        <h1>This is an example of the Paginator widget</h1>

        <p>
            <button id="btn-enable">Enable Paginator widget</button>
        </p>

        <ul id="page-content">
            <?php foreach ($items as $item) { ?>
                <li>
                    Item #<?=e($item->id)?>
                </li>
            <?php } ?>
        </ul>

        <p id="paging">
            <?php foreach ($db->getPageNumbers() as $p) { ?>
                <?= $p > 1 ? '|' : '' ?>
                <?php if ($p === $page) { ?>
                    <strong><?=e($p)?></strong>
                <?php } else { ?>
                    <a href="?p=<?=e($p)?>"><?=e($p)?></a>
                <?php } ?>
            <?php } ?>
        </p>

        <script type="text/javascript" src="../dist/js/nittro.full.js"></script>
        <script type="text/javascript">
            _stack.push(function (di) {

                // The Paginator isn't initialised automatically so that you can see
                // how the page works without it
                document.getElementById('btn-enable').addEventListener('click', function (evt) {
                    evt.preventDefault();

                    this.parentNode.innerHTML = 'Now scroll down!';

                    // Now you only need to create an instance of the Paginator widget.
                    var paginator = di.create('paginator', { options: {
                        container: document.getElementById('page-content'),
                        template: '<li>Item #%id%</li>',
                        url: '?p=%page%',
                        currentPage: <?= json_encode((int) $page) ?>,
                        pageSize: <?= (int) $pageSize ?>,
                        pageCount: <?= (int) $pages ?>
                    }});

                    // We can get rid of the plain paging links because we don't need them anymore
                    document.getElementById('paging').innerHTML = 'Oh, and check out the URL in your browser\'s address bar!';

                });
            });
        </script>
    </body>
</html>