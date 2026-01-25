const express = require('express');
const router = express.Router();
const SocialPost = require('../models/SocialPost');
const ImageKit = require('imagekit');
const multer = require('multer');

// Configure ImageKit
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// GET all posts with advanced filtering & sorting
router.get('/', async (req, res) => {
    try {
        const isAdmin = req.query.view === 'admin';
        let query = {};

        // Filtering
        if (!isAdmin) {
            query.status = 'Published';
            query.isHidden = false;
            query.$or = [
                { scheduledAt: { $exists: false } },
                { scheduledAt: { $lte: new Date() } }
            ];
        }

        if (req.query.categoryId && req.query.categoryId !== 'all') {
            query.category = req.query.categoryId;
        }

        if (req.query.date) {
            const date = new Date(req.query.date);
            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);
            query.createdAt = {
                $gte: date,
                $lt: nextDate
            };
        }

        let sort = { createdAt: -1 };
        if (req.query.sort === 'trending') {
            // MongoDB Aggegation would be better for perfect calculation, 
            // but for simplicity/speed let's just sort by likes for now or use a basic simple sort.
            // A true trending score needs aggregation.
            // Let's stick to standard sort for now unless User insists on complex algo in mongo.
            // Actually, let's try to implement a simple JS sort after fetch if dataset is small,
            // or better, sort by likes descending as proxy for "trending"
            sort = { likes: -1, comments: -1, shares: -1 };
        }

        const posts = await SocialPost.find(query)
            .populate('category') // Populate category name
            .sort(sort);

        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE a post
router.post('/', upload.single('image'), async (req, res) => {
    try {
        let imageUrl = '';
        if (req.file) {
            const uploadResponse = await imagekit.upload({
                file: req.file.buffer,
                fileName: `social_post_${Date.now()}_${req.file.originalname}`,
                folder: '/social-posts'
            });
            imageUrl = uploadResponse.url;
        } else if (req.body.imageUrl) {
            imageUrl = req.body.imageUrl;
        }

        const post = new SocialPost({
            title: req.body.title,
            category: req.body.categoryId || null,
            caption: req.body.caption,
            hashtags: req.body.hashtags,
            imageUrl: imageUrl,
            scheduledAt: req.body.scheduledAt || null,
            status: req.body.status || 'Draft',
            isHidden: false
        });

        const newPost = await post.save();
        res.status(201).json({ success: true, data: newPost });
    } catch (err) {
        console.error('❌ Error creating post:', err);
        res.status(400).json({ success: false, message: err.message });
    }
});

// UPDATE a post
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const post = await SocialPost.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        let imageUrl = post.imageUrl;
        if (req.file) {
            const uploadResponse = await imagekit.upload({
                file: req.file.buffer,
                fileName: `social_post_${Date.now()}_${req.file.originalname}`,
                folder: '/social-posts'
            });
            imageUrl = uploadResponse.url;
        }

        if (req.body.title) post.title = req.body.title;
        if (req.body.categoryId) post.category = req.body.categoryId;
        if (req.body.caption) post.caption = req.body.caption;
        if (req.body.hashtags !== undefined) post.hashtags = req.body.hashtags;
        if (req.body.scheduledAt !== undefined) post.scheduledAt = req.body.scheduledAt;
        if (req.body.status) post.status = req.body.status;
        if (req.body.isHidden !== undefined) post.isHidden = req.body.isHidden === 'true' || req.body.isHidden === true;

        post.imageUrl = imageUrl;

        const updatedPost = await post.save();
        res.json({ success: true, data: updatedPost });
    } catch (err) {
        console.error('❌ Error updating post:', err);
        res.status(400).json({ success: false, message: err.message });
    }
});

// DELETE a post
router.delete('/:id', async (req, res) => {
    try {
        const post = await SocialPost.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
        await post.deleteOne();
        res.json({ success: true, message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// TOGGLE VISIBILITY (Hide/Show)
router.put('/:id/toggle-visibility', async (req, res) => {
    try {
        const post = await SocialPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.isHidden = !post.isHidden;
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// LIKE
router.post('/:id/like', async (req, res) => {
    try {
        const post = await SocialPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        post.likes += 1;
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// SHARE
router.post('/:id/share', async (req, res) => {
    try {
        const post = await SocialPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        post.shares += 1;
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// COMMENT
router.post('/:id/comment', async (req, res) => {
    try {
        const post = await SocialPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (req.body.text) {
            post.comments.push({ text: req.body.text });
            await post.save();
            res.json(post);
        } else {
            res.status(400).json({ message: 'Comment text required' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
