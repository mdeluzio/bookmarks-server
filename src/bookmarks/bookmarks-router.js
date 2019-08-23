const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../logger');
//const { bookmarks } = require('../store');
const BookmarksService = require('./bookmarks-service');

const bookmarksRouter = express.Router();
const bodyParser = express.json();

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: bookmark.title,
    url: bookmark.url,
    description: bookmark.description,
    rating: Number(bookmark.rating),
})

bookmarksRouter
    .route('/bookmarks')
    .get((req, res, next) => {
        BookmarksService.getAllBookmarks(req.app.get('db'))
            .then(bookmarks => {
                res.json(bookmarks.map(serializeBookmark))
            })
            .catch(next)
    })
    .post(bodyParser, (req, res) => {
        const { title, url, description} = req.body;
        let { rating } = req.body

        if(!title) {
            logger.error(`Title is required`);
            return res.status(400).send(`Invalid title data`)
        }

        if(!url) {
            logger.error(`url is required`);
            return res.status(400).send(`Invalid url data`)
        }

        if(!url.startsWith('http')){
            logger.error(`url does not start with http`)
            return res.status(400).send(`Invalid url`)
        }

        if(!description) {
            logger.error(`Description is required`);
            return res.status(400).send(`Invalid description data`)
        }

        if(!rating) {
            logger.error(`Rating is required`);
            return res.status(400).send(`Invalid rating data`);
        }

        if(isNaN(parseInt(rating)) || parseInt(rating) > 5) {
            logger.error(`Rating must be a number between 1 and 5`);
            return res.status(400).send(`Invalid data. Rating must be a number between 1 and 5`)
        }

        rating = parseInt(rating);
        
        const id = uuid();

        const bookmark = {
            id,
            title,
            url,
            description,
            rating
        };

        bookmarks.push(bookmark)

        logger.info(`Bookmark with id ${id} created`);

        res.status(201)
            .location(`http://localhost:8000/bookmarks/${id}`)
            .json(bookmark)
        ;
    })
;

bookmarksRouter
    .route('/bookmarks/:id')
    .get((req, res, next) => {
        const { id } = req.params;

        BookmarksService.getById(req.app.get('db'), id)
            .then(bookmark => {
                if(!bookmark) {
                    logger.error(`Bookmark with id ${id} not found`)
                    return res.status(404).json({
                        error: { message: `Bookmark Not Found` }
                    })
                }
                res.json(serializeBookmark(bookmark))
            })
            .catch(next)
    })
    .delete((req, res) => {
        const { id } = req.params;

        const bookmarkIndex = bookmarks.findIndex(bm => bm.id === id);

        if(bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${id} not found`)
            return res.status(404).send(`Bookmark not found`)
        }

        bookmarks.splice(bookmarkIndex, 1);

        logger.info(`Bookmark with id ${id} deleted`)

        res.status(204).end()
    })
;

module.exports = bookmarksRouter;