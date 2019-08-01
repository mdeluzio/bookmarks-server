const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../logger');
const { bookmarks } = require('../store');

const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.status(200).json(bookmarks)
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
    .get((req, res) => {
        const { id } = req.params;

        const bookmark = bookmarks.find(bm => bm.id === id);

        if(!bookmark) {
            logger.error(`Bookmark with id ${id} not found`)
            return res.status(404).send(`Bookmark not found`)
        }

        res.status(200).json(bookmark);
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