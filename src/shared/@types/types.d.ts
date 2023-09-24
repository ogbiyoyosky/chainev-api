import ObjectLiteral from "../interfaces/object-literal.interface";

declare global {
      interface Request {
        user: ObjectLiteral
      }

}