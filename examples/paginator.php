<?php


// let's define some helpers first
function e($s) {
    return htmlspecialchars($s, ENT_QUOTES);
}

function render_item($item) {
    return '<span class="label" data-id="' . e($item->id) . '">Item #' . e($item->id) . '</span>';
}




// create some test data
$pages = 15;
$pageSize = 40;
$db = array_map(function($id) { return (object) ['id' => $id]; }, range(1, $pages * $pageSize));


// get relevant data to process request
$page = isset($_GET['p']) ? (int) $_GET['p'] : 1;

// something like $db->getItemsByPage($page)
$items = array_slice($db, ($page - 1) * $pageSize, $pageSize);



if (isSet($_SERVER['HTTP_X_REQUESTED_WITH'])) {
    Header('Content-Type: application/json');

    // simulate rendering items on the current page as dynamic snippets
    $snippets = [];

    foreach ($items as $item) {
        $snippets['snippet--item-' . $item->id] = render_item($item);

    }

    echo json_encode(['snippets' => $snippets]);
    exit;

} else if ($page > $pages) {
    Header('Location: ' . $_SERVER['PHP_SELF']);
    exit;

}

?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Nittro Paginator widget example</title>

        <script type="application/json" id="nittro-params">
            {
                "basePath": "/"
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

        <ul id="snippet--content" class="snippet-container" data-dynamic-mask="snippet--item-\d+" data-dynamic-element="li" data-dynamic-sort=".label(id) asc">
            <?php foreach ($items as $item) { ?>
                <li id="snippet--item-<?=e($item->id)?>">
                    <?= render_item($item) ?>
                </li>
            <?php } ?>
        </ul>

        <p id="paging">
            <?php for ($i = 1; $i <= $pages; $i++) { ?>
                <?= $i > 1 ? '|' : '' ?>
                <?php if ($i === $page) { ?>
                    <strong><?=e($i)?></strong>
                <?php } else { ?>
                    <a href="?p=<?=e($i)?>"><?=e($i)?></a>
                <?php } ?>
            <?php } ?>
        </p>

        <script type="text/javascript" src="../dist/js/nittro.full.js"></script>
        <script type="text/javascript">
            _stack.push(function (Nittro, di) {

                // The Paginator isn't initialised automatically so that you can see
                // how the page works without it
                document.getElementById('btn-enable').addEventListener('click', function (evt) {
                    evt.preventDefault();

                    this.parentNode.innerHTML = 'Now scroll down!';

                    // Now you only need to create an instance of the Paginator widget.
                    // Usually you'd have a factory registered in the DI container
                    // so that you don't need to inject the Page service manually.
                    var paginator = new Nittro.Widgets.Paginator(di.getService('page'), {
                        container: document.getElementById('snippet--content'),
                        items: '?p=%page%',
                        currentPage: <?= json_encode((int) $page) ?>
                    });

                    // We can get rid of the plain paging links because we don't need them anymore
                    document.getElementById('paging').innerHTML = '';

                });
            });
        </script>
    </body>
</html>
