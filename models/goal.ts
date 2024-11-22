import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const GoalSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    priority: { type: String, enum: ['haute', 'moyenne', 'basse'], default: 'moyenne' },
    status: { type: String, enum: ['non démarré', 'en cours', 'complet'], default: 'non démarré' },
    targetDate: { type: Date, required: true },
    dependencies: [{ type: Schema.Types.ObjectId, ref: 'Goal' }],
    milestones: [{ // Tableau de jalons
        title: { type: String, required: true }, // Titre du jalon
        description: { type: String }, // Description du jalon
        targetDate: { type: Date, required: true }, // Date cible du jalon
        completed: {type: Boolean, default: false},
        everyDayAction: {type:Boolean, default:false},
        status: { type: String, enum: ['non démarré', 'en cours', 'complet'], default: 'non démarré' }
    }],
    progress: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Met à jour la date de modification avant chaque sauvegarde
GoalSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.model('Goal', GoalSchema);
