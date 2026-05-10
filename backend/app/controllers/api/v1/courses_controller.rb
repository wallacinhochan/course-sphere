class Api::V1::CoursesController < ApplicationController
  before_action :set_course,       only: [:show, :update, :destroy]
  before_action :authorize_creator!, only: [:update, :destroy]

  def index
    page     = (params[:page] || 1).to_i
    per_page = 6

    base = current_user.created_courses
                      .left_joins(:lessons)
                      .select('courses.*, COUNT(lessons.id) AS lessons_count')
                      .group('courses.id')
                      .order(created_at: :desc)

    total   = current_user.created_courses.count
    courses = base.offset((page - 1) * per_page).limit(per_page)

    render json: {
      courses: courses.as_json(only: [:id, :name, :description, :start_date, :end_date, :lessons_count]),
      meta: {
        total:       total,
        page:        page,
        per_page:    per_page,
        total_pages: (total.to_f / per_page).ceil
      }
    }
  end

  def show
  render json: @course.as_json(
    only: [:id, :name, :description, :start_date, :end_date, :creator_id],
    include: { 
      lessons: { only: [:id, :title, :status, :video_url] },
      creator: { only: [:id, :name] }
      }
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