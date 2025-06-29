import mongoose from "mongoose";

export const UserTier = {
  FREE: "free",
  PREMIUM: "premium",
};

export const RateLimits = {
  [UserTier.FREE]: {
    messagesPerDay: 25,
  },
  [UserTier.PREMIUM]: {
    messagesPerDay: 50,
  },
  UNAUTHENTICATED: {
    messagesPerDay: 5,
  },
};

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },

    accounts: [
      {
        provider: {
          type: String,
          required: true,
          enum: ["google", "github"],
        },
        providerAccountId: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
        access_token: String,
        refresh_token: String,
        expires_at: Number,
        token_type: String,
        scope: String,
        id_token: String,
        session_state: String,
      },
    ],

    tier: {
      type: String,
      enum: Object.values(UserTier),
      default: UserTier.FREE,
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "canceled", "past_due", "unpaid", "incomplete"],
      default: null,
    },
    subscriptionId: {
      type: String,
      default: null,
    },
    customerId: {
      type: String,
      default: null,
    },
    subscriptionStart: {
      type: Date,
      default: null,
    },
    subscriptionEnd: {
      type: Date,
      default: null,
    },

    usage: {
      messagesToday: {
        type: Number,
        default: 0,
      },
      lastMessageTime: {
        type: Date,
        default: null,
      },
      dailyResetTime: {
        type: Date,
        default: () => {
          const now = new Date();
          const currentHour = now.getHours();

          if (currentHour < 12) {
            now.setHours(12, 0, 0, 0);
          } else {
            now.setDate(now.getDate() + 1);
            now.setHours(0, 0, 0, 0);
          }
          return now;
        },
      },
      hourlyResetTime: {
        type: Date,
        default: () => {
          const nextHour = new Date();
          nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
          return nextHour;
        },
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

UserSchema.index({ "accounts.provider": 1, "accounts.providerAccountId": 1 });
UserSchema.index({ tier: 1 });
UserSchema.index({ subscriptionStatus: 1 });

UserSchema.methods.isPremium = function () {
  return (
    this.tier === UserTier.PREMIUM &&
    this.subscriptionStatus === "active" &&
    this.subscriptionEnd &&
    this.subscriptionEnd > new Date()
  );
};

UserSchema.methods.getRateLimits = function () {
  if (this.isPremium()) {
    return RateLimits[UserTier.PREMIUM];
  }
  return RateLimits[UserTier.FREE];
};

UserSchema.methods.resetUsageIfNeeded = async function () {
  const now = new Date();
  let needsSave = false;

  if (now > this.usage.dailyResetTime) {
    this.usage.documentsToday = 0;
    this.usage.youtubeVideosToday = 0;
    this.usage.messagesToday = 0;
    const next = new Date(now);
    const currentHour = next.getHours();

    if (currentHour < 12) {
      next.setHours(12, 0, 0, 0);
    } else {
      next.setDate(next.getDate() + 1);
      next.setHours(0, 0, 0, 0);
    }
    this.usage.dailyResetTime = next;
    needsSave = true;
  }

  if (now > this.usage.hourlyResetTime) {
    const nextHour = new Date(now);
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
    this.usage.hourlyResetTime = nextHour;
    needsSave = true;
  }

  if (needsSave) {
    await this.save();
  }
};

UserSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save();
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
