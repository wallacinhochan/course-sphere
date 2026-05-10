class Api::V1::LessonsController < ApplicationController
  before_action :set_course, only: [:index, :create]
  before_action :set_lesson, only: [:update, :destroy]

  def index
    render json: @course.lessons.order(created_at: :desc)
  end

  def create
    lesson = @course.lessons.build(lesson_params)
    if lesson.save
      render json: lesson, status: :created
    else
      render json: { errors: lesson.errors.full_messages },
             status: :unprocessable_entity
    end
  end

  def update
    if @lesson.update(lesson_params)
      render json: @lesson
    else
      render json: { errors: @lesson.errors.full_messages },
             status: :unprocessable_entity
    end
  end

  def destroy
    @lesson.destroy
    head :no_content
  end

  private

  def set_course
    @course = Course.find(params[:course_id])
  end

  def set_lesson
    @lesson = Lesson.find(params[:id])
  end

  def lesson_params
    params.require(:lesson).permit(:title, :status, :video_url)
  end
end