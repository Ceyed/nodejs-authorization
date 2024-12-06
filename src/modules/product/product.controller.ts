import { Request, Response } from 'express';

export class ProductController {
    private static _instance: ProductController;

    private constructor() {}

    public static getInstance(): ProductController {
        if (!ProductController._instance) {
            ProductController._instance = new ProductController();
        }
        return ProductController._instance;
    }

    read(_: Request, res: Response): void {
        try {
            res.status(200).json({ message: "You have access to 'Product:Read'" });
        } catch (error) {
            res.status(401).json({ message: 'Error in reading product' });
        }
    }

    create(_: Request, res: Response): void {
        try {
            res.status(200).json({ message: "You have access to 'Product:Create'" });
        } catch (error) {
            res.status(401).json({ message: 'Error in creating product' });
        }
    }

    update(_: Request, res: Response): void {
        try {
            res.status(200).json({ message: "You have access to 'Product:Update'" });
        } catch (error) {
            res.status(401).json({ message: 'Error in updating product' });
        }
    }

    delete(_: Request, res: Response): void {
        try {
            res.status(200).json({ message: "You have access to 'Product:Delete'" });
        } catch (error) {
            res.status(401).json({ message: 'Error in deleting product' });
        }
    }
}
