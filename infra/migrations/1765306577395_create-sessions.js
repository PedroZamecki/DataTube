exports.up = (pgm) => {
  pgm.createTable("sessions", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    token: {
      //
      type: "varchar(96)",
      notNull: true,
      unique: true,
    },

    user_id: {
      type: "uuid",
      notNull: true,
      // We will NOT MAKE THE REFERENCE it directly.
    },

    expires_at: {
      // timestamptz = timestamp + time zone
      // https://justatheory.com/2012/04/postgres-use-timestamptz/
      type: "timestamptz",
      notNull: true,
    },

    created_at: {
      // timestamptz = timestamp + time zone
      // https://justatheory.com/2012/04/postgres-use-timestamptz/
      type: "timestamptz",
      default: pgm.func("timezone('utc', now())"),
      notNull: true,
    },

    updated_at: {
      type: "timestamptz",
      default: pgm.func("timezone('utc', now())"),
      notNull: true,
    },
  });
};

exports.down = false;
