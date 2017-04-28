class CreateCourseUsers < ActiveRecord::Migration[5.0]
  def change
    create_table :course_users do |t|
      t.references :user
      t.references :course
      t.timestamps
    end
  end
end
