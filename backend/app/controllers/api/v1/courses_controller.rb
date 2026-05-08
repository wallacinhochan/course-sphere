class Api::V1::CoursesController < ApplicationController
  before_action :set_course,       only: [:show, :update, :destroy]
  before_action :authorize_creator!, only: [:update, :destroy]

  def index
    courses = current_user.created_courses.order(created_at: :desc)
    render json: courses.as_json(only: [:id, :name, :description, :start_date, :end_date])
  end

  def show
  render json: @course.as_json(
    only: [:id, :name, :description, :start_date, :end_date, :creator_id],
    include: { lessons: { only: [:id, :title, :status, :video_url] } }
  )
  end

  def create
    course = current_user.created_courses.build(course_params)
    if course.save
      render json: course, status: :created
    else
      render json: { errors: course.errors.full_messages },
             status: :unprocessable_entity
    end
  end

  def update
    if @course.update(course_params)
      render json: @course
    else
      render json: { errors: @course.errors.full_messages },
             status: :unprocessable_entity
    end
  end

  def destroy
    @course.destroy
    head :no_content
  end

  private

  def set_course
    @course = Course.find(params[:id])
  end

  def authorize_creator!
    unless @course.creator == current_user
      render json: { error: "Não autorizado" }, status: :forbidden
    end
  end

  def course_params
    params.require(:course).permit(:name, :description, :start_date, :end_date)
  end
end