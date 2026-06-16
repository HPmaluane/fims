-- ============================================================
-- FIMS - Seeds (run AFTER schema.sql)
-- Default password for all users: Fims@2024
-- bcrypt hash of "Fims@2024"
-- ============================================================

-- Template Sections
INSERT INTO template_sections (id, code, name, sort_order) VALUES
  ('11111111-0000-0000-0000-000000000001', 'pessoal',      'Pessoal de Limpeza', 1),
  ('11111111-0000-0000-0000-000000000002', 'gabinetes',    'Gabinetes',           2),
  ('11111111-0000-0000-0000-000000000003', 'copas',        'Copas / Copa',        3),
  ('11111111-0000-0000-0000-000000000004', 'casas_banho',  'Casas de Banho',      4);

-- Template Items - Pessoal
INSERT INTO template_items (code, section_id, text, max_score, sort_order) VALUES
  ('p1', '11111111-0000-0000-0000-000000000001', 'Todos os funcionários têm uniforme limpo e engomado?',            5, 1),
  ('p2', '11111111-0000-0000-0000-000000000001', 'Todos os funcionários estão asseados e profissionais?',           5, 2),
  ('p3', '11111111-0000-0000-0000-000000000001', 'São treinados adequadamente nas tarefas regularmente?',           5, 3),
  ('p4', '11111111-0000-0000-0000-000000000001', 'Estão seguindo as regras de segurança?',                          5, 4),
  ('p5', '11111111-0000-0000-0000-000000000001', 'O local de equipamentos e material está limpo e organizado?',     5, 5),
  ('p6', '11111111-0000-0000-0000-000000000001', 'A Administração está feliz com o desempenho das funções?',        5, 6);

-- Template Items - Gabinetes
INSERT INTO template_items (code, section_id, text, max_score, sort_order) VALUES
  ('g1',  '11111111-0000-0000-0000-000000000002', 'O tapete é aspirado regularmente?',                              5,  1),
  ('g2',  '11111111-0000-0000-0000-000000000002', 'Os cantos e bordas são aspirados regularmente?',                 5,  2),
  ('g3',  '11111111-0000-0000-0000-000000000002', 'Existem muitos pontos e manchas no tapete?',                     5,  3),
  ('g4',  '11111111-0000-0000-0000-000000000002', 'O chão é limpo e lavado regularmente?',                          5,  4),
  ('g5',  '11111111-0000-0000-0000-000000000002', 'Argamassa limpa?',                                               5,  5),
  ('g6',  '11111111-0000-0000-0000-000000000002', 'Rodapés limpos, sem poeira e manchas?',                          5,  6),
  ('g7',  '11111111-0000-0000-0000-000000000002', 'As bordas e cantos estão livres de teias e poeira?',             5,  7),
  ('g8',  '11111111-0000-0000-0000-000000000002', 'A parede está livre de manchas, pichações, etc.?',               5,  8),
  ('g9',  '11111111-0000-0000-0000-000000000002', 'Portas limpas e livres de impressões digitais e manchas?',       5,  9),
  ('g10', '11111111-0000-0000-0000-000000000002', 'O tampo das mesas está livre de poeira?',                        5, 10),
  ('g11', '11111111-0000-0000-0000-000000000002', 'Todas as cadeiras estão livres de pó?',                          5, 11),
  ('g12', '11111111-0000-0000-0000-000000000002', 'Os recipientes de lixo são esvaziados regularmente?',            5, 12),
  ('g13', '11111111-0000-0000-0000-000000000002', 'Todas as janelas estão livres de manchas e impressões digitais?',5, 13);

-- Template Items - Copas
INSERT INTO template_items (code, section_id, text, max_score, sort_order) VALUES
  ('c1', '11111111-0000-0000-0000-000000000003', 'O chão é limpo e lavado regularmente?',               5, 1),
  ('c2', '11111111-0000-0000-0000-000000000003', 'Rodapés limpos, sem poeira e manchas?',               5, 2),
  ('c3', '11111111-0000-0000-0000-000000000003', 'A geleira é limpa dentro e fora regularmente?',       5, 3),
  ('c4', '11111111-0000-0000-0000-000000000003', 'A chaleira é limpa regularmente?',                    5, 4),
  ('c5', '11111111-0000-0000-0000-000000000003', 'O microondas é limpo regularmente?',                  5, 5),
  ('c6', '11111111-0000-0000-0000-000000000003', 'O lavatório e torneira são limpos regularmente?',     5, 6),
  ('c7', '11111111-0000-0000-0000-000000000003', 'Os armários estão limpos e livres de migalhas?',      5, 7),
  ('c8', '11111111-0000-0000-0000-000000000003', 'Toda a loiça é lavada e arrumada devidamente?',       5, 8);

-- Template Items - Casas de Banho
INSERT INTO template_items (code, section_id, text, max_score, sort_order) VALUES
  ('b1', '11111111-0000-0000-0000-000000000004', 'Todos os dispensadores estão limpos e devidamente recarregados?', 5, 1),
  ('b2', '11111111-0000-0000-0000-000000000004', 'Todos os dispensadores estão em boas condições?',                 5, 2),
  ('b3', '11111111-0000-0000-0000-000000000004', 'Os cantos e bordas são varridos ou aspirados completamente?',     5, 3),
  ('b4', '11111111-0000-0000-0000-000000000004', 'Todas as pias estão livres de manchas de água e limpas?',         5, 4),
  ('b5', '11111111-0000-0000-0000-000000000004', 'As peças de aço inoxidável são polidas e livres de manchas?',     5, 5),
  ('b6', '11111111-0000-0000-0000-000000000004', 'Todos os banheiros/urinóis estão livres de manchas?',             5, 6),
  ('b7', '11111111-0000-0000-0000-000000000004', 'Existe problema de mau cheiro?',                                  5, 7),
  ('b8', '11111111-0000-0000-0000-000000000004', 'O chão é limpo diariamente com limpador desinfetante?',           5, 8),
  ('b9', '11111111-0000-0000-0000-000000000004', 'Todas as latas de lixo são esvaziadas e limpas regularmente?',    5, 9);

-- Users (password: Fims@2024)
INSERT INTO users (id, name, email, password, role, avatar, active) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Sistema Admin',     'admin@fims.co.mz',      '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2TPNxUJKjW', 'admin',      'SA', true),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Carlos Machava',    'ceo@fims.co.mz',        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2TPNxUJKjW', 'ceo',        'CM', true),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'Ana Sitoe',         'supervisor@fims.co.mz', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2TPNxUJKjW', 'supervisor', 'AS', true),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'João Tembe',        'inspector1@fims.co.mz', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2TPNxUJKjW', 'inspector',  'JT', true),
  ('aaaaaaaa-0000-0000-0000-000000000005', 'Maria Nhantumbo',   'inspector2@fims.co.mz', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2TPNxUJKjW', 'inspector',  'MN', true);

-- Locations
INSERT INTO locations (id, name, address, supervisor_id) VALUES
  ('bbbbbbbb-0000-0000-0000-000000000001', 'Baker Hughes',   'Av. Julius Nyerere, Maputo',       'aaaaaaaa-0000-0000-0000-000000000003'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Bayport',        'Av. 24 de Julho, Maputo',           'aaaaaaaa-0000-0000-0000-000000000003'),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'Biofund',        'Av. Marginal, Maputo',              'aaaaaaaa-0000-0000-0000-000000000003'),
  ('bbbbbbbb-0000-0000-0000-000000000004', 'Radisson Hotel', 'Av. Julius Nyerere 1234, Maputo',   'aaaaaaaa-0000-0000-0000-000000000003'),
  ('bbbbbbbb-0000-0000-0000-000000000005', 'Casino',         'Av. da Marginal, Maputo',           'aaaaaaaa-0000-0000-0000-000000000003'),
  ('bbbbbbbb-0000-0000-0000-000000000006', 'Hollard Seguros','Rua dos Desportistas, Maputo',      'aaaaaaaa-0000-0000-0000-000000000003');
