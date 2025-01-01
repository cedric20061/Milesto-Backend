import mongoose from "mongoose";
const Schema = mongoose.Schema;

const DailyScheduleSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: {
    type: String,
    required: true,
  },
  tasks: [
    {
      title: { type: String, required: true },
      description: { type: String },
      priority: {
        type: String,
        enum: ["haute", "moyenne", "basse"],
        default: "moyenne",
      },
      status: {
        type: String,
        enum: ["à faire", "en cours", "complet"],
        default: "à faire",
      },
      estimatedTime: { type: Number, required: true },
      startTime: { type: String },
      endTime: { type: String },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

DailyScheduleSchema.pre("save", async function (next) {
  const DailySchedule = mongoose.model("DailySchedule");

  try {
    const schedules = await DailySchedule.find({ userId: this.userId }).sort({
      date: 1,
    });

    if (schedules.length >= 7) {
      const oldestSchedule = schedules[0];

      // Assurez-vous que date est bien comparée correctement
      if (new Date(`${oldestSchedule.date}T00:00:00.000Z`) < new Date()) {
        await DailySchedule.findByIdAndDelete(oldestSchedule._id);
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("DailySchedule", DailyScheduleSchema);
