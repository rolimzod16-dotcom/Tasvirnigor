import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import { projectsTable } from "./projects";
import { categoriesTable } from "./categories";

export const projectCategoriesTable = pgTable(
  "project_categories",
  {
    projectId: integer("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categoriesTable.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.categoryId] })]
);
