import { Request, Response } from 'express';

export class ProductController {
    static read(_: Request, res: Response): void {
        try {
            res.status(200).json({ message: "You have access to 'Product:Read'" });
        } catch (error) {
            res.status(401).json({ message: 'Error in reading product' });
        }
    }
    static create(_: Request, res: Response): void {
        try {
            res.status(200).json({ message: "You have access to 'Product:Create'" });
        } catch (error) {
            res.status(401).json({ message: 'Error in creating product' });
        }
    }

    static update(_: Request, res: Response): void {
        try {
            res.status(200).json({ message: "You have access to 'Product:Update'" });
        } catch (error) {
            res.status(401).json({ message: 'Error in updating product' });
        }
    }

    static delete(_: Request, res: Response): void {
        try {
            res.status(200).json({ message: "You have access to 'Product:Delete'" });
        } catch (error) {
            res.status(401).json({ message: 'Error in deleting product' });
        }
    }
}
