import { Request, Response } from 'express';

export class BlogController {
    static read(_: Request, res: Response): void {
        try {
            res.status(200).json({ message: "You have access to 'Blog:Read'" });
        } catch (error) {
            res.status(401).json({ message: 'Error in reading blog' });
        }
    }
    static create(_: Request, res: Response): void {
        try {
            res.status(200).json({ message: "You have access to 'Blog:Create'" });
        } catch (error) {
            res.status(401).json({ message: 'Error in creating blog' });
        }
    }

    static update(_: Request, res: Response): void {
        try {
            res.status(200).json({ message: "You have access to 'Blog:Update'" });
        } catch (error) {
            res.status(401).json({ message: 'Error in updating blog' });
        }
    }

    static delete(_: Request, res: Response): void {
        try {
            res.status(200).json({ message: "You have access to 'Blog:Delete'" });
        } catch (error) {
            res.status(401).json({ message: 'Error in deleting blog' });
        }
    }
}
