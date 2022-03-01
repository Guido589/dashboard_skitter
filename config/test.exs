import Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :dashboard_skitter, DashboardSkitterWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "rlZPMnCF8Jr9D0ZacAybyxIuU7MYFJZPW3ZnZoxbfAPpDglILz88oE9AHyU/yM/C",
  server: false

# Print only warnings and errors during test
config :logger, level: :warn

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime
