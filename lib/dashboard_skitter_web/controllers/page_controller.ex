defmodule DashboardSkitterWeb.PageController do
  use DashboardSkitterWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
