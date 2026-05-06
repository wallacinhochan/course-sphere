puts "Criando usuários..."

user1 = User.find_or_create_by!(email: "ana@test.com") do |u|
  u.name     = "Ana Silva"
  u.password = "123456"
end

user2 = User.find_or_create_by!(email: "bruno@test.com") do |u|
  u.name     = "Bruno Costa"
  u.password = "123456"
end

puts "Criando cursos..."

course1 = user1.created_courses.find_or_create_by!(name: "Rails do Zero") do |c|
  c.description = "Aprenda Ruby on Rails do básico ao avançado"
  c.start_date  = Date.today
  c.end_date    = Date.today + 30
end

course2 = user1.created_courses.find_or_create_by!(name: "React na Prática") do |c|
  c.description = "Componentes, hooks e integração com APIs"
  c.start_date  = Date.today + 5
  c.end_date    = Date.today + 35
end

puts "Criando aulas..."

[
  { title: "Instalação e setup",  status: "published" },
  { title: "MVC na prática",      status: "published" },
  { title: "API com JWT",         status: "draft"     }
].each { |l| course1.lessons.find_or_create_by!(title: l[:title]) { |r| r.status = l[:status] } }

[
  { title: "Componentes básicos", status: "published" },
  { title: "useState e useEffect", status: "published" },
  { title: "Consumindo APIs",     status: "draft"     }
].each { |l| course2.lessons.find_or_create_by!(title: l[:title]) { |r| r.status = l[:status] } }

puts "Seeds concluídos!"
puts "  ana@test.com / 123456"
puts "  bruno@test.com / 123456"