import mongoose, { Schema, Document } from 'mongoose'

export interface ITodoItem extends Document {
  _id: string
  title: string
  completed: boolean
  createdAt: Date
}

export interface ITodoList extends Document {
  _id: string
  userId: mongoose.Types.ObjectId
  name: string
  description?: string
  items: ITodoItem[]
  createdAt: Date
  color: string
}

// Schéma pour les items
const TodoItemSchema = new Schema<ITodoItem>({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { _id: true }) // _id activé par défaut, sert d'identifiant

// Schéma pour la liste
const TodoListSchema = new Schema<ITodoList>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  items: { type: [TodoItemSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  color: { type: String, required: true }
})

export default mongoose.model<ITodoList>('TodoList', TodoListSchema)
