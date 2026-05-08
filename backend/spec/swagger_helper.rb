require 'rails_helper'
require 'rswag/specs'

RSpec.configure do |config|
  config.swagger_root = Rails.root.join('swagger').to_s

  config.swagger_docs = {
    'v1/swagger.yaml' => {
      openapi: '3.0.1',
      info: {
        title: 'CourseSphere API',
        version: 'v1',
        description: 'API de gestão de cursos online'
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: :http,
            scheme: :bearer,
            bearerFormat: 'JWT'
          }
        }
      },
      security: [{ bearerAuth: [] }],
      servers: [
        { url: 'http://localhost:3000', description: 'Development' }
      ]
    }
  }

  config.swagger_format = :yaml
end