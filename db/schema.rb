# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20_201_221_180_025) do
  # These are extensions that must be enabled in order to support this database
  enable_extension 'plpgsql'

  create_table 'classroom_psets', force: :cascade do |t|
    t.integer 'classroom_id'
    t.integer 'p_set_id'
    t.datetime 'created_at', null: false
    t.datetime 'updated_at', null: false
    t.index ['classroom_id'], name: 'index_classroom_psets_on_classroom_id'
    t.index ['p_set_id'], name: 'index_classroom_psets_on_p_set_id'
  end

  create_table 'classroom_users', force: :cascade do |t|
    t.integer 'user_id'
    t.integer 'classroom_id'
    t.datetime 'created_at', null: false
    t.datetime 'updated_at', null: false
    t.index ['classroom_id'], name: 'index_classroom_users_on_classroom_id'
    t.index ['user_id'], name: 'index_classroom_users_on_user_id'
  end

  create_table 'classrooms', force: :cascade do |t|
    t.integer 'course_id'
    t.string 'name'
    t.datetime 'created_at', null: false
    t.datetime 'updated_at', null: false
    t.index ['course_id'], name: 'index_classrooms_on_course_id'
  end

  create_table 'course_users', force: :cascade do |t|
    t.integer 'user_id'
    t.integer 'course_id'
    t.datetime 'created_at', null: false
    t.datetime 'updated_at', null: false
    t.index ['course_id'], name: 'index_course_users_on_course_id'
    t.index ['user_id'], name: 'index_course_users_on_user_id'
  end

  create_table 'courses', force: :cascade do |t|
    t.string 'name'
    t.datetime 'created_at', null: false
    t.datetime 'updated_at', null: false
  end

  create_table 'exercise_categories', force: :cascade do |t|
    t.string 'name'
    t.datetime 'created_at', null: false
    t.datetime 'updated_at', null: false
  end

  create_table 'exercise_subcategories', force: :cascade do |t|
    t.string 'name'
    t.integer 'exercise_category_id'
    t.datetime 'created_at', null: false
    t.datetime 'updated_at', null: false
    t.index ['exercise_category_id'], name: 'index_exercise_subcategories_on_exercise_category_id'
  end

  create_table 'p_set_answers', force: :cascade do |t|
    t.integer 'p_set_id'
    t.integer 'user_id'
    t.json 'data'
    t.boolean 'completed', default: false
    t.datetime 'created_at', null: false
    t.datetime 'updated_at', null: false
    t.index %w[p_set_id user_id], name: 'index_p_set_answers_on_p_set_id_and_user_id', unique: true
    t.index ['p_set_id'], name: 'index_p_set_answers_on_p_set_id'
    t.index ['user_id'], name: 'index_p_set_answers_on_user_id'
  end

  create_table 'p_set_audios', force: :cascade do |t|
    t.string 'audio'
    t.string 'name'
    t.datetime 'created_at', null: false
    t.datetime 'updated_at', null: false
  end

  create_table 'p_set_to_audios', force: :cascade do |t|
    t.integer 'p_set_id'
    t.integer 'p_set_audio_id'
    t.datetime 'created_at', null: false
    t.datetime 'updated_at', null: false
    t.index ['p_set_audio_id'], name: 'index_p_set_to_audios_on_p_set_audio_id'
    t.index %w[p_set_id p_set_audio_id], name: 'index_p_set_to_audios_on_p_set_id_and_p_set_audio_id', unique: true
    t.index ['p_set_id'], name: 'index_p_set_to_audios_on_p_set_id'
  end

  create_table 'p_sets', force: :cascade do |t|
    t.string 'name'
    t.datetime 'created_at', null: false
    t.datetime 'updated_at', null: false
    t.integer 'user_id'
    t.integer 'exercise_subcategory_id'
    t.integer 'exercise_subcategory_level', default: 1
    t.json 'data'
    t.index ['exercise_subcategory_id'], name: 'index_p_sets_on_exercise_subcategory_id'
    t.index ['user_id'], name: 'index_p_sets_on_user_id'
  end

  create_table 'registration_keys', force: :cascade do |t|
    t.string 'key'
    t.datetime 'created_at', null: false
    t.datetime 'updated_at', null: false
  end

  create_table 'users', force: :cascade do |t|
    t.string 'firstname'
    t.string 'lastname'
    t.string 'email', default: '', null: false
    t.string 'encrypted_password', default: '', null: false
    t.string 'reset_password_token'
    t.datetime 'reset_password_sent_at'
    t.datetime 'remember_created_at'
    t.integer 'sign_in_count', default: 0, null: false
    t.datetime 'current_sign_in_at'
    t.datetime 'last_sign_in_at'
    t.inet 'current_sign_in_ip'
    t.inet 'last_sign_in_ip'
    t.datetime 'created_at', null: false
    t.datetime 'updated_at', null: false
    t.boolean 'admin', default: false, null: false
    t.string 'student_id', default: '', null: false
    t.index ['email'], name: 'index_users_on_email', unique: true
    t.index ['reset_password_token'], name: 'index_users_on_reset_password_token', unique: true
  end
end
