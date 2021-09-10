const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const Book = require('../models/book')
const Author = require('../models/author')

const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg' , 'image/png', 'image/gif']

const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

//All Books Route
router.get('/', async (req, res) => {

    try {
        const books = await  Book.find({})
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

//New Book Route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
})

//Create Book Route
router.post('/', upload.single('cover'), async (req, res) => {

    const fileName = req.file != null ? req.file.filename : null

    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishedDate: new Date(req.body.publishedDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    })

    try {
        const newBook = await book.save()
        //  res.redirect(`books/${newBook.id}`)
        res.redirect(`books`)

    } catch (error) {
        if (book.coverImageName) {
            removeBookCover(book.coverImageName)
        }
        renderNewPage(res, book, true)
    }
})


async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({})

        const params = {
            authors: authors,
            book: book
        }
        if (hasError) {
            params.errorMessage = 'Error Creating a Book!'
        }
        res.render('books/new', params)
    } catch {
        res.redirect('/books')
    }
}

function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if(err) console.log(err)
    })
}


module.exports = router