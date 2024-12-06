import { Request, Response } from 'express';

export class BlogController {
    private static _instance: BlogController;

    private constructor() {}

    public static getInstance(): BlogController {
        if (!BlogController._instance) {
            BlogController._instance = new BlogController();
        }
        return BlogController._instance;
    }

    read(_: Request, res: Response): void {
        try {
            res.status(200).json({ message: "You have access to 'Blog:Read'" });
        } catch (error) {
            res.status(401).json({ message: 'Error in reading blog' });
        }
    }

    create(_: Request, res: Response): void {
        try {
            res.status(200).json({ message: "You have access to 'Blog:Create'" });
        } catch (error) {
            res.status(401).json({ message: 'Error in creating blog' });
        }
    }

    update(_: Request, res: Response): void {
        try {
            res.status(200).json({ message: "You have access to 'Blog:Update'" });
        } catch (error) {
            res.status(401).json({ message: 'Error in updating blog' });
        }
    }

    delete(_: Request, res: Response): void {
        try {
            res.status(200).json({ message: "You have access to 'Blog:Delete'" });
        } catch (error) {
            res.status(401).json({ message: 'Error in deleting blog' });
        }
    }
}
