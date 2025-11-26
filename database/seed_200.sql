-- Executar em PostgreSQL após criar o schema via create_database.sql

BEGIN;

-- As inserções em Classificacao e Pessoas já estão completas e serão omitidas aqui
-- para evitar repetição, mas o comando completo incluiria elas.

-- Re-executando as inserções iniciais para garantir que os IDs estejam corretos
INSERT INTO Classificacao (descricao, tipo, categoria, subcategoria, ativo) VALUES
('MANUTENÇÃO E OPERAÇÃO','DESPESA','OPERACIONAL','MANUTENÇÃO',TRUE),
('COMBUSTÍVEL','DESPESA','OPERACIONAL','COMBUSTÍVEL',TRUE),
('FERTILIZANTES','DESPESA','INSUMOS','FERTILIZANTES',TRUE),
('SEMENTES','DESPESA','INSUMOS','SEMENTES',TRUE),
('DEFENSIVOS','DESPESA','INSUMOS','DEFENSIVOS',TRUE),
('MÃO DE OBRA','DESPESA','PESSOAL','SALÁRIOS',TRUE),
('ENERGIA ELÉTRICA','DESPESA','OPERACIONAL','UTILIDADES',TRUE),
('ÁGUA','DESPESA','OPERACIONAL','UTILIDADES',TRUE),
('TELEFONE/INTERNET','DESPESA','ADMINISTRATIVA','COMUNICAÇÃO',TRUE),
('CONSULTORIA','DESPESA','ADMINISTRATIVA','SERVIÇOS',TRUE),
('VENDA DE PRODUTOS','RECEITA','PRODUTOS','COLHEITA',TRUE) -- Adicionando 'VENDA DE PRODUTOS' para classificação de ENTRADA
ON CONFLICT (descricao) DO NOTHING;

INSERT INTO Pessoas (nome, tipo_pessoa, documento, tipo_relacionamento, ativo) VALUES
('IGUACU MAQUINAS AGRICOLAS LTDA','JURIDICA','33656729002385','FORNECEDOR',TRUE),
('Casa da Agropecuária Oeste LTDA','JURIDICA','14927382000160','FORNECEDOR',TRUE),
('Sementes Boa Safra LTDA','JURIDICA','85236974000121','FORNECEDOR',TRUE),
('Distribuidora de Fertilizantes Cerrado LTDA','JURIDICA','56473829000145','FORNECEDOR',TRUE),
('Defensivos Verde Campo LTDA','JURIDICA','96385274000133','FORNECEDOR',TRUE),
('Posto Rural São Miguel LTDA','JURIDICA','32165498000175','FORNECEDOR',TRUE),
('Oficina do Trator & Implementos LTDA','JURIDICA','14725836000190','FORNECEDOR',TRUE),
('Energia Rural do Paraná S/A','JURIDICA','78945612000108','FORNECEDOR',TRUE),
('Água e Saneamento Rural Ltda','JURIDICA','14796325800037','FORNECEDOR',TRUE),
('NetCampo Internet Rural Ltda','JURIDICA','95175382000180','FORNECEDOR',TRUE),
('Consultoria Agronômica Horizonte Ltda','JURIDICA','75395148000159','FORNECEDOR',TRUE),
('Armazém São João LTDA','JURIDICA','80123456000110','CLIENTE',TRUE),
('Cerealista Campo Verde LTDA','JURIDICA','81234567000120','CLIENTE',TRUE),
('Cooperativa de Produtores Rurais do Vale','JURIDICA','89012345000199','CLIENTE',TRUE),
('Cooperativa AgroNorte','JURIDICA','82345678000130','CLIENTE',TRUE),
('Comércio de Grãos Oeste LTDA','JURIDICA','83456789000140','CLIENTE',TRUE),
('AgroExport Brasil Ltda','JURIDICA','84567890000150','CLIENTE',TRUE),
('Graneleiro Sul Ltda','JURIDICA','85678901000160','CLIENTE',TRUE),
('Mercado de Grãos Cerrado Ltda','JURIDICA','86789012000170','CLIENTE',TRUE),
('Coopergrãos Vale do Ivaí','JURIDICA','87890123000180','CLIENTE',TRUE),
('Cerealista Boa Colheita Ltda','JURIDICA','88901234000190','CLIENTE',TRUE),
('CICLANO DA SILVA','FISICA','99999999999','FATURADO',TRUE),
('João Pedro Almeida','FISICA','10123456789','FATURADO',TRUE),
('Maria Eduarda Lopes','FISICA','10234567890','FATURADO',TRUE),
('Carlos Henrique Souza','FISICA','10345678901','FATURADO',TRUE),
('Ana Paula Gomes','FISICA','10456789012','FATURADO',TRUE),
('Pedro Lucas Ferreira','FISICA','10567890123','FATURADO',TRUE),
('Luana Martins','FISICA','10678901234','FATURADO',TRUE),
('Rafael Oliveira','FISICA','10789012345','FATURADO',TRUE),
('Beatriz Costa','FISICA','10890123456','FATURADO',TRUE),
('Marcos Vinícius Rocha','FISICA','10901234567','FATURADO',TRUE),
('Camila Carvalho','FISICA','11012345678','FATURADO',TRUE),
('Gustavo Santana','FISICA','11123456789','FATURADO',TRUE),
('Larissa Ribeiro','FISICA','11234567890','FATURADO',TRUE),
('Tiago Cunha','FISICA','11345678901','FATURADO',TRUE),
('Patrícia Azevedo','FISICA','11456789012','FATURADO',TRUE),
('Rodrigo Farias','FISICA','11567890123','FATURADO',TRUE),
('Juliana Pires','FISICA','11678901234','FATURADO',TRUE),
('André Moreira','FISICA','11789012345','FATURADO',TRUE),
('Fernanda Nunes','FISICA','11890123456','FATURADO',TRUE),
('Bruno Almeida','FISICA','11901234567','FATURADO',TRUE)
ON CONFLICT (documento) DO NOTHING;

-- Tabela de valores iniciais já existentes (50 registros)
WITH v_initial(nf, emissao, venc, valor_total, tipo_mov, status, descricao, fornecedor_doc, faturado_doc, class_desc) AS (
  VALUES
('NF000001','2025-10-05','2025-11-30',12840.00,'SAIDA','PENDENTE','Compra de ureia 45% para adubação de cobertura safra 2025','56473829000145','10123456789','FERTILIZANTES'),
('NF000002','2025-10-06','2025-11-30',8450.00,'SAIDA','PENDENTE','Aquisição de sementes de soja cultivar BRS 7780','85236974000121','10234567890','SEMENTES'),
('NF000003','2025-10-07','2025-11-30',6230.00,'SAIDA','PENDENTE','Compra de glifosato 480 SL para manejo de plantas daninhas','96385274000133','10345678901','DEFENSIVOS'),
('NF000004','2025-10-08','2025-11-30',3480.50,'SAIDA','PENDENTE','Diesel S10 para tratores e colheitadeira - outubro/2025','32165498000175','10456789012','COMBUSTÍVEL'),
('NF000005','2025-10-09','2025-11-30',2150.00,'SAIDA','PAGO','Revisão de trator JD 5070E: troca de filtros e óleo','14725836000190','10567890123','MANUTENÇÃO E OPERAÇÃO'),
('NF000006','2025-10-10','2025-10-25',980.35,'SAIDA','PAGO','Energia elétrica sede rural - outubro/2025','78945612000108','10678901234','ENERGIA ELÉTRICA'),
('NF000007','2025-10-10','2025-10-25',140.85,'SAIDA','PAGO','Serviço de água sede rural - outubro/2025','14796325800037','10789012345','ÁGUA'),
('NF000008','2025-10-11','2025-10-20',199.90,'SAIDA','PAGO','Plano Internet Rural 50Mbps - outubro/2025','95175382000180','10890123456','TELEFONE/INTERNET'),
('NF000009','2025-10-12','2025-10-25',1600.00,'SAIDA','PENDENTE','Consultoria agronômica: ajuste de adubação nitrogenada','75395148000159','10901234567','CONSULTORIA'),
('NF000010','2025-10-13','2025-11-10',82750.00,'ENTRADA','PENDENTE','Venda de soja safra 2025 para cooperativa','89012345000199','99999999999','VENDA DE PRODUTOS'),
('NF000011','2025-09-12','2025-10-30',13420.00,'SAIDA','PENDENTE','Compra de ureia 45% para talhão 03','56473829000145','11012345678','FERTILIZANTES'),
('NF000012','2025-09-13','2025-10-30',7890.00,'SAIDA','PENDENTE','Aquisição de sementes de milho híbrido AG 8700','85236974000121','11123456789','SEMENTES'),
('NF000013','2025-09-14','2025-10-30',7125.40,'SAIDA','PENDENTE','Aquisição de 2,5 L de inseticida lambda-cyhalothrin','96385274000133','11234567890','DEFENSIVOS'),
('NF000014','2025-09-15','2025-10-30',4250.10,'SAIDA','PENDENTE','Diesel S10 para colheitadeira - safra inverno','32165498000175','11345678901','COMBUSTÍVEL'),
('NF000015','2025-09-16','2025-10-20',2980.00,'SAIDA','PAGO','Troca de correias e alinhamento em plantadeira','14725836000190','11456789012','MANUTENÇÃO E OPERAÇÃO'),
('NF000016','2025-09-16','2025-09-25',915.78,'SAIDA','PAGO','Energia elétrica pivô central - setembro/2025','78945612000108','11567890123','ENERGIA ELÉTRICA'),
('NF000017','2025-09-17','2025-09-25',132.44,'SAIDA','PAGO','Serviço de água - setembro/2025','14796325800037','11678901234','ÁGUA'),
('NF000018','2025-09-18','2025-09-25',219.90,'SAIDA','PAGO','Internet rural 50Mbps - setembro/2025','95175382000180','11789012345','TELEFONE/INTERNET'),
('NF000019','2025-09-18','2025-10-05',1800.00,'SAIDA','PENDENTE','Consultoria: manejo de pragas na soja','75395148000159','11890123456','CONSULTORIA'),
('NF000020','2025-09-19','2025-10-10',74500.00,'ENTRADA','PAGO','Venda de milho safrinha 2025 para cerealista','81234567000120','11901234567','VENDA DE PRODUTOS'),
('NF000021','2025-08-20','2025-09-25',11580.00,'SAIDA','PENDENTE','Compra de ureia 45% para cobertura de milho','56473829000145','10123456789','FERTILIZANTES'),
('NF000022','2025-08-21','2025-09-25',6420.00,'SAIDA','PENDENTE','Aquisição de sementes de trigo cultivar BRS 264','85236974000121','10234567890','SEMENTES'),
('NF000023','2025-08-22','2025-09-25',5320.00,'SAIDA','PENDENTE','Herbicida glifosato 480 SL - aplicação pós-colheita','96385274000133','10345678901','DEFENSIVOS'),
('NF000024','2025-08-23','2025-09-25',3890.90,'SAIDA','VENCIDO','Diesel S10 para transporte de grãos','32165498000175','10456789012','COMBUSTÍVEL'),
('NF000025','2025-08-24','2025-09-20',2440.00,'SAIDA','PAGO','Revisão de colheitadeira: lubrificação e troca de rolamentos','14725836000190','10567890123','MANUTENÇÃO E OPERAÇÃO'),
('NF000026','2025-08-25','2025-09-05',810.65,'SAIDA','PAGO','Energia elétrica galpão de máquinas - agosto/2025','78945612000108','10678901234','ENERGIA ELÉTRICA'),
('NF000027','2025-08-25','2025-09-05',118.90,'SAIDA','PAGO','Serviço de água - agosto/2025','14796325800037','10789012345','ÁGUA'),
('NF000028','2025-08-26','2025-09-05',189.90,'SAIDA','PAGO','Internet rural 50Mbps - agosto/2025','95175382000180','10890123456','TELEFONE/INTERNET'),
('NF000029','2025-08-27','2025-09-10',1650.00,'SAIDA','PENDENTE','Consultoria: diagnóstico de fertilidade do solo','75395148000159','10901234567','CONSULTORIA'),
('NF000030','2025-08-28','2025-09-20',82500.00,'ENTRADA','PENDENTE','Venda de soja para Armazém São João','80123456000110','99999999999','VENDA DE PRODUTOS'),
('NF000031','2025-07-15','2025-08-15',12050.00,'SAIDA','PENDENTE','Compra de ureia 45% para talhão 07','56473829000145','11012345678','FERTILIZANTES'),
('NF000032','2025-07-16','2025-08-15',7220.00,'SAIDA','PENDENTE','Sementes de milho híbrido DKB 390 PRO3','85236974000121','11123456789','SEMENTES'),
('NF000033','2025-07-17','2025-08-15',4980.00,'SAIDA','PENDENTE','Fungicida triazol para controle de ferrugem','96385274000133','11234567890','DEFENSIVOS'),
('NF000034','2025-07-18','2025-08-15',3150.40,'SAIDA','PENDENTE','Diesel para preparo de solo','32165498000175','11345678901','COMBUSTÍVEL'),
('NF000035','2025-07-18','2025-08-05',1760.00,'SAIDA','PAGO','Conserto de semeadora: substituição de discos','14725836000190','11456789012','MANUTENÇÃO E OPERAÇÃO'),
('NF000036','2025-07-19','2025-07-30',890.00,'SAIDA','PAGO','Energia elétrica residência rural - julho/2025','78945612000108','11567890123','ENERGIA ELÉTRICA'),
('NF000037','2025-07-19','2025-07-30',125.70,'SAIDA','PAGO','Serviço de água - julho/2025','14796325800037','11678901234','ÁGUA'),
('NF000038','2025-07-20','2025-07-30',209.90,'SAIDA','PAGO','Internet rural 50Mbps - julho/2025','95175382000180','11789012345','TELEFONE/INTERNET'),
('NF000039','2025-07-20','2025-08-10',1750.00,'SAIDA','PENDENTE','Consultoria: regulagem de adubadora','75395148000159','11890123456','CONSULTORIA'),
('NF000040','2025-07-21','2025-08-20',90500.00,'ENTRADA','PAGO','Venda de milho para Cooperativa AgroNorte','82345678000130','11901234567','VENDA DE PRODUTOS'),
('NF000041','2025-06-02','2025-07-31',13260.00,'SAIDA','PENDENTE','Ureia 45% para cobertura em milho safrinha','56473829000145','10123456789','FERTILIZANTES'),
('NF000042','2025-06-03','2025-07-31',6480.00,'SAIDA','PENDENTE','Sementes de trigo BRS 264 - 40 sacas','85236974000121','10234567890','SEMENTES'),
('NF000043','2025-06-04','2025-07-31',5850.00,'SAIDA','PENDENTE','Herbicida 2,4-D para dessecação','96385274000133','10345678901','DEFENSIVOS'),
('NF000044','2025-06-05','2025-07-31',3620.00,'SAIDA','VENCIDO','Diesel S10 - preparo e transporte','32165498000175','10456789012','COMBUSTÍVEL'),
('NF000045','2025-06-05','2025-07-20',2480.00,'SAIDA','PAGO','Manutenção de rolo compactador','14725836000190','10567890123','MANUTENÇÃO E OPERAÇÃO'),
('NF000046','2025-06-06','2025-06-25',870.20,'SAIDA','PAGO','Energia elétrica sede rural - junho/2025','78945612000108','10678901234','ENERGIA ELÉTRICA'),
('NF000047','2025-06-06','2025-06-25',129.80,'SAIDA','PAGO','Serviço de água - junho/2025','14796325800037','10789012345','ÁGUA'),
('NF000048','2025-06-07','2025-06-25',199.90,'SAIDA','PAGO','Internet rural 50Mbps - junho/2025','95175382000180','10890123456','TELEFONE/INTERNET'),
('NF000049','2025-06-08','2025-07-05',1950.00,'SAIDA','PENDENTE','Consultoria: planejamento de plantio safra verão','75395148000159','10901234567','CONSULTORIA'),
('NF000050','2025-06-09','2025-07-20',78500.00,'ENTRADA','PENDENTE','Venda de soja para Cerealista Campo Verde','81234567000120','99999999999','VENDA DE PRODUTOS')
)
INSERT INTO MovimentoContas (numero_documento, data_emissao, data_vencimento, valor_total, tipo_movimento, status_pagamento, descricao, fornecedor_id, faturado_id)
SELECT v_initial.nf, v_initial.emissao::date, v_initial.venc::date, v_initial.valor_total, v_initial.tipo_mov, v_initial.status, v_initial.descricao, pf.id, ft.id
FROM v_initial
JOIN Pessoas pf ON pf.documento = v_initial.fornecedor_doc
JOIN Pessoas ft ON ft.documento = v_initial.faturado_doc
WHERE NOT EXISTS (
    SELECT 1 FROM MovimentoContas mm WHERE mm.numero_documento = v_initial.nf
);

INSERT INTO ParcelasContas (movimento_id, numero_parcela, data_vencimento, valor_parcela)
SELECT m.id, 1, m.data_vencimento, m.valor_total
FROM MovimentoContas m
WHERE m.numero_documento LIKE 'NF%'
ON CONFLICT DO NOTHING;

WITH v_initial(nf, emissao, venc, valor_total, tipo_mov, status, descricao, fornecedor_doc, faturado_doc, class_desc) AS (
  VALUES
('NF000001','2025-10-05','2025-11-30',12840.00,'SAIDA','PENDENTE','Compra de ureia 45% para adubação de cobertura safra 2025','56473829000145','10123456789','FERTILIZANTES'),
('NF000002','2025-10-06','2025-11-30',8450.00,'SAIDA','PENDENTE','Aquisição de sementes de soja cultivar BRS 7780','85236974000121','10234567890','SEMENTES'),
('NF000003','2025-10-07','2025-11-30',6230.00,'SAIDA','PENDENTE','Compra de glifosato 480 SL para manejo de plantas daninhas','96385274000133','10345678901','DEFENSIVOS'),
('NF000004','2025-10-08','2025-11-30',3480.50,'SAIDA','PENDENTE','Diesel S10 para tratores e colheitadeira - outubro/2025','32165498000175','10456789012','COMBUSTÍVEL'),
('NF000005','2025-10-09','2025-11-30',2150.00,'SAIDA','PAGO','Revisão de trator JD 5070E: troca de filtros e óleo','14725836000190','10567890123','MANUTENÇÃO E OPERAÇÃO'),
('NF000006','2025-10-10','2025-10-25',980.35,'SAIDA','PAGO','Energia elétrica sede rural - outubro/2025','78945612000108','10678901234','ENERGIA ELÉTRICA'),
('NF000007','2025-10-10','2025-10-25',140.85,'SAIDA','PAGO','Serviço de água sede rural - outubro/2025','14796325800037','10789012345','ÁGUA'),
('NF000008','2025-10-11','2025-10-20',199.90,'SAIDA','PAGO','Plano Internet Rural 50Mbps - outubro/2025','95175382000180','10890123456','TELEFONE/INTERNET'),
('NF000009','2025-10-12','2025-10-25',1600.00,'SAIDA','PENDENTE','Consultoria agronômica: ajuste de adubação nitrogenada','75395148000159','10901234567','CONSULTORIA'),
('NF000010','2025-10-13','2025-11-10',82750.00,'ENTRADA','PENDENTE','Venda de soja safra 2025 para cooperativa','89012345000199','99999999999','VENDA DE PRODUTOS'),
('NF000011','2025-09-12','2025-10-30',13420.00,'SAIDA','PENDENTE','Compra de ureia 45% para talhão 03','56473829000145','11012345678','FERTILIZANTES'),
('NF000012','2025-09-13','2025-10-30',7890.00,'SAIDA','PENDENTE','Aquisição de sementes de milho híbrido AG 8700','85236974000121','11123456789','SEMENTES'),
('NF000013','2025-09-14','2025-10-30',7125.40,'SAIDA','PENDENTE','Aquisição de 2,5 L de inseticida lambda-cyhalothrin','96385274000133','11234567890','DEFENSIVOS'),
('NF000014','2025-09-15','2025-10-30',4250.10,'SAIDA','PENDENTE','Diesel S10 para colheitadeira - safra inverno','32165498000175','11345678901','COMBUSTÍVEL'),
('NF000015','2025-09-16','2025-10-20',2980.00,'SAIDA','PAGO','Troca de correias e alinhamento em plantadeira','14725836000190','11456789012','MANUTENÇÃO E OPERAÇÃO'),
('NF000016','2025-09-16','2025-09-25',915.78,'SAIDA','PAGO','Energia elétrica pivô central - setembro/2025','78945612000108','11567890123','ENERGIA ELÉTRICA'),
('NF000017','2025-09-17','2025-09-25',132.44,'SAIDA','PAGO','Serviço de água - setembro/2025','14796325800037','11678901234','ÁGUA'),
('NF000018','2025-09-18','2025-09-25',219.90,'SAIDA','PAGO','Internet rural 50Mbps - setembro/2025','95175382000180','11789012345','TELEFONE/INTERNET'),
('NF000019','2025-09-18','2025-10-05',1800.00,'SAIDA','PENDENTE','Consultoria: manejo de pragas na soja','75395148000159','11890123456','CONSULTORIA'),
('NF000020','2025-09-19','2025-10-10',74500.00,'ENTRADA','PAGO','Venda de milho safrinha 2025 para cerealista','81234567000120','11901234567','VENDA DE PRODUTOS'),
('NF000021','2025-08-20','2025-09-25',11580.00,'SAIDA','PENDENTE','Compra de ureia 45% para cobertura de milho','56473829000145','10123456789','FERTILIZANTES'),
('NF000022','2025-08-21','2025-09-25',6420.00,'SAIDA','PENDENTE','Aquisição de sementes de trigo cultivar BRS 264','85236974000121','10234567890','SEMENTES'),
('NF000023','2025-08-22','2025-09-25',5320.00,'SAIDA','PENDENTE','Herbicida glifosato 480 SL - aplicação pós-colheita','96385274000133','10345678901','DEFENSIVOS'),
('NF000024','2025-08-23','2025-09-25',3890.90,'SAIDA','VENCIDO','Diesel S10 para transporte de grãos','32165498000175','10456789012','COMBUSTÍVEL'),
('NF000025','2025-08-24','2025-09-20',2440.00,'SAIDA','PAGO','Revisão de colheitadeira: lubrificação e troca de rolamentos','14725836000190','10567890123','MANUTENÇÃO E OPERAÇÃO'),
('NF000026','2025-08-25','2025-09-05',810.65,'SAIDA','PAGO','Energia elétrica galpão de máquinas - agosto/2025','78945612000108','10678901234','ENERGIA ELÉTRICA'),
('NF000027','2025-08-25','2025-09-05',118.90,'SAIDA','PAGO','Serviço de água - agosto/2025','14796325800037','10789012345','ÁGUA'),
('NF000028','2025-08-26','2025-09-05',189.90,'SAIDA','PAGO','Internet rural 50Mbps - agosto/2025','95175382000180','10890123456','TELEFONE/INTERNET'),
('NF000029','2025-08-27','2025-09-10',1650.00,'SAIDA','PENDENTE','Consultoria: diagnóstico de fertilidade do solo','75395148000159','10901234567','CONSULTORIA'),
('NF000030','2025-08-28','2025-09-20',82500.00,'ENTRADA','PENDENTE','Venda de soja para Armazém São João','80123456000110','99999999999','VENDA DE PRODUTOS'),
('NF000031','2025-07-15','2025-08-15',12050.00,'SAIDA','PENDENTE','Compra de ureia 45% para talhão 07','56473829000145','11012345678','FERTILIZANTES'),
('NF000032','2025-07-16','2025-08-15',7220.00,'SAIDA','PENDENTE','Sementes de milho híbrido DKB 390 PRO3','85236974000121','11123456789','SEMENTES'),
('NF000033','2025-07-17','2025-08-15',4980.00,'SAIDA','PENDENTE','Fungicida triazol para controle de ferrugem','96385274000133','11234567890','DEFENSIVOS'),
('NF000034','2025-07-18','2025-08-15',3150.40,'SAIDA','PENDENTE','Diesel para preparo de solo','32165498000175','11345678901','COMBUSTÍVEL'),
('NF000035','2025-07-18','2025-08-05',1760.00,'SAIDA','PAGO','Conserto de semeadora: substituição de discos','14725836000190','11456789012','MANUTENÇÃO E OPERAÇÃO'),
('NF000036','2025-07-19','2025-07-30',890.00,'SAIDA','PAGO','Energia elétrica residência rural - julho/2025','78945612000108','11567890123','ENERGIA ELÉTRICA'),
('NF000037','2025-07-19','2025-07-30',125.70,'SAIDA','PAGO','Serviço de água - julho/2025','14796325800037','11678901234','ÁGUA'),
('NF000038','2025-07-20','2025-07-30',209.90,'SAIDA','PAGO','Internet rural 50Mbps - julho/2025','95175382000180','11789012345','TELEFONE/INTERNET'),
('NF000039','2025-07-20','2025-08-10',1750.00,'SAIDA','PENDENTE','Consultoria: regulagem de adubadora','75395148000159','11890123456','CONSULTORIA'),
('NF000040','2025-07-21','2025-08-20',90500.00,'ENTRADA','PAGO','Venda de milho para Cooperativa AgroNorte','82345678000130','11901234567','VENDA DE PRODUTOS'),
('NF000041','2025-06-02','2025-07-31',13260.00,'SAIDA','PENDENTE','Ureia 45% para cobertura em milho safrinha','56473829000145','10123456789','FERTILIZANTES'),
('NF000042','2025-06-03','2025-07-31',6480.00,'SAIDA','PENDENTE','Sementes de trigo BRS 264 - 40 sacas','85236974000121','10234567890','SEMENTES'),
('NF000043','2025-06-04','2025-07-31',5850.00,'SAIDA','PENDENTE','Herbicida 2,4-D para dessecação','96385274000133','10345678901','DEFENSIVOS'),
('NF000044','2025-06-05','2025-07-31',3620.00,'SAIDA','VENCIDO','Diesel S10 - preparo e transporte','32165498000175','10456789012','COMBUSTÍVEL'),
('NF000045','2025-06-05','2025-07-20',2480.00,'SAIDA','PAGO','Manutenção de rolo compactador','14725836000190','10567890123','MANUTENÇÃO E OPERAÇÃO'),
('NF000046','2025-06-06','2025-06-25',870.20,'SAIDA','PAGO','Energia elétrica sede rural - junho/2025','78945612000108','10678901234','ENERGIA ELÉTRICA'),
('NF000047','2025-06-06','2025-06-25',129.80,'SAIDA','PAGO','Serviço de água - junho/2025','14796325800037','10789012345','ÁGUA'),
('NF000048','2025-06-07','2025-06-25',199.90,'SAIDA','PAGO','Internet rural 50Mbps - junho/2025','95175382000180','10890123456','TELEFONE/INTERNET'),
('NF000049','2025-06-08','2025-07-05',1950.00,'SAIDA','PENDENTE','Consultoria: planejamento de plantio safra verão','75395148000159','10901234567','CONSULTORIA'),
('NF000050','2025-06-09','2025-07-20',78500.00,'ENTRADA','PENDENTE','Venda de soja para Cerealista Campo Verde','81234567000120','99999999999','VENDA DE PRODUTOS')
)
INSERT INTO MovimentoContas_has_Classificacao (movimento_id, classificacao_id, valor_classificacao, percentual, justificativa)
SELECT m.id, c.id, m.valor_total, 100.00, 'Classificação conforme descrição da NF'
FROM MovimentoContas m
JOIN v_initial ON v_initial.nf = m.numero_documento
JOIN Classificacao c ON c.descricao = v_initial.class_desc
ON CONFLICT DO NOTHING;

-- Tabela de valores adicionais (150 registros - NF000051 a NF000200)

WITH v_additional(nf, emissao, venc, valor_total, tipo_mov, status, fornecedor_doc, faturado_doc, class_desc, desc_base) AS (
    VALUES
    -- NF51 - SAIDA (Fertilizantes) - Set/25
    ('NF000051','2025-09-01','2025-10-30',15100.00,'SAIDA','PENDENTE','56473829000145','10123456789','FERTILIZANTES','Compra de NPK 05-25-25 para plantio de inverno'),
    -- NF52 - SAIDA (Sementes) - Set/25
    ('NF000052','2025-09-02','2025-10-30',8120.00,'SAIDA','PENDENTE','85236974000121','10234567890','SEMENTES','Sementes de forrageira para rotação'),
    -- NF53 - SAIDA (Defensivos) - Ago/25
    ('NF000053','2025-08-03','2025-09-30',5750.00,'SAIDA','PENDENTE','96385274000133','10345678901','DEFENSIVOS','Insumo para controle de percevejo na soja'),
    -- NF54 - SAIDA (Combustível) - Ago/25
    ('NF000054','2025-08-04','2025-09-25',3950.00,'SAIDA','VENCIDO','32165498000175','10456789012','COMBUSTÍVEL','Óleo diesel para tratores - mês de agosto'),
    -- NF55 - SAIDA (Manutenção) - Jul/25
    ('NF000055','2025-07-05','2025-08-20',1900.00,'SAIDA','PAGO','14725836000190','10567890123','MANUTENÇÃO E OPERAÇÃO','Reparo em sistema hidráulico do pulverizador'),
    -- NF56 - SAIDA (Energia) - Jul/25
    ('NF000056','2025-07-06','2025-07-30',920.50,'SAIDA','PAGO','78945612000108','10678901234','ENERGIA ELÉTRICA','Energia elétrica - galpão e escritório - julho'),
    -- NF57 - SAIDA (Água) - Jul/25
    ('NF000057','2025-07-06','2025-07-30',150.00,'SAIDA','PAGO','14796325800037','10789012345','ÁGUA','Consumo de água - julho/2025'),
    -- NF58 - SAIDA (Comunicação) - Jul/25
    ('NF000058','2025-07-07','2025-07-20',220.00,'SAIDA','PAGO','95175382000180','10890123456','TELEFONE/INTERNET','Fatura de internet/telefone - julho'),
    -- NF59 - SAIDA (Consultoria) - Jun/25
    ('NF000059','2025-06-08','2025-07-10',1700.00,'SAIDA','PENDENTE','75395148000159','10901234567','CONSULTORIA','Monitoramento e controle de doenças no trigo'),
    -- NF60 - ENTRADA - Jun/25
    ('NF000060','2025-06-09','2025-07-05',85000.00,'ENTRADA','PAGO','83456789000140','99999999999','VENDA DE PRODUTOS','Venda de trigo safra inverno'),

    -- NF61 - SAIDA (Mão de Obra/Salários) - Mai/25
    ('NF000061','2025-05-10','2025-05-30',15000.00,'SAIDA','PAGO','14927382000160','11012345678','MÃO DE OBRA','Salário e encargos funcionário rural - maio'),
    -- NF62 - SAIDA (Fertilizantes) - Mai/25
    ('NF000062','2025-05-11','2025-06-30',13800.00,'SAIDA','PENDENTE','56473829000145','11123456789','FERTILIZANTES','Calcário dolomítico para correção de solo'),
    -- NF63 - SAIDA (Sementes) - Abr/25
    ('NF000063','2025-04-12','2025-05-30',7550.00,'SAIDA','PENDENTE','85236974000121','11234567890','SEMENTES','Sementes de aveia preta'),
    -- NF64 - SAIDA (Defensivos) - Abr/25
    ('NF000064','2025-04-13','2025-05-30',6100.00,'SAIDA','PENDENTE','96385274000133','11345678901','DEFENSIVOS','Dessecante final para colheita de milho'),
    -- NF65 - SAIDA (Combustível) - Mar/25
    ('NF000065','2025-03-14','2025-04-20',4500.00,'SAIDA','PAGO','32165498000175','11456789012','COMBUSTÍVEL','Abastecimento para colheita e transporte'),
    -- NF66 - SAIDA (Manutenção) - Mar/25
    ('NF000066','2025-03-15','2025-04-05',2850.00,'SAIDA','PAGO','14725836000190','11567890123','MANUTENÇÃO E OPERAÇÃO','Revisão geral do caminhão de transporte'),
    -- NF67 - SAIDA (Energia) - Fev/25
    ('NF000067','2025-02-16','2025-03-05',1050.00,'SAIDA','VENCIDO','78945612000108','11678901234','ENERGIA ELÉTRICA','Energia elétrica (alta estação) - fevereiro'),
    -- NF68 - SAIDA (Água) - Fev/25
    ('NF000068','2025-02-16','2025-03-05',175.00,'SAIDA','PAGO','14796325800037','11789012345','ÁGUA','Serviço de água - fevereiro'),
    -- NF69 - SAIDA (Comunicação) - Fev/25
    ('NF000069','2025-02-17','2025-02-25',199.90,'SAIDA','PAGO','95175382000180','11890123456','TELEFONE/INTERNET','Fatura de internet/telefone - fevereiro'),
    -- NF70 - ENTRADA - Fev/25
    ('NF000070','2025-02-18','2025-03-10',95000.00,'ENTRADA','PENDENTE','84567890000150','11901234567','VENDA DE PRODUTOS','Venda de soja antecipada - AgroExport Brasil'),

    -- NF71 - SAIDA (Consultoria) - Jan/25
    ('NF000071','2025-01-19','2025-02-10',2100.00,'SAIDA','PENDENTE','75395148000159','10123456789','CONSULTORIA','Análise e planejamento da safra de verão'),
    -- NF72 - SAIDA (Mão de Obra/Salários) - Jan/25
    ('NF000072','2025-01-20','2025-01-30',14500.00,'SAIDA','PAGO','14927382000160','10234567890','MÃO DE OBRA','Salário e encargos funcionário rural - janeiro'),
    -- NF73 - SAIDA (Fertilizantes) - Out/25
    ('NF000073','2025-10-01','2025-11-20',11900.00,'SAIDA','PENDENTE','56473829000145','10345678901','FERTILIZANTES','Superfosfato triplo para adubação de base'),
    -- NF74 - SAIDA (Sementes) - Out/25
    ('NF000074','2025-10-02','2025-11-20',7300.00,'SAIDA','PENDENTE','85236974000121','10456789012','SEMENTES','Sementes de sorgo para safrinha'),
    -- NF75 - SAIDA (Defensivos) - Set/25
    ('NF000075','2025-09-03','2025-10-15',4800.00,'SAIDA','PENDENTE','96385274000133','10567890123','DEFENSIVOS','Fungicida para ferrugem asiática'),
    -- NF76 - SAIDA (Combustível) - Set/25
    ('NF000076','2025-09-04','2025-10-15',3300.00,'SAIDA','PENDENTE','32165498000175','10678901234','COMBUSTÍVEL','Diesel para aplicação de defensivos'),
    -- NF77 - SAIDA (Manutenção) - Ago/25
    ('NF000077','2025-08-05','2025-09-05',2600.00,'SAIDA','PAGO','14725836000190','10789012345','MANUTENÇÃO E OPERAÇÃO','Troca de pneus do trator de menor porte'),
    -- NF78 - SAIDA (Energia) - Ago/25
    ('NF000078','2025-08-06','2025-08-25',850.00,'SAIDA','PAGO','78945612000108','10890123456','ENERGIA ELÉTRICA','Energia elétrica - agosto'),
    -- NF79 - SAIDA (Água) - Jul/25
    ('NF000079','2025-07-07','2025-07-20',120.00,'SAIDA','PAGO','14796325800037','10901234567','ÁGUA','Serviço de água - julho'),
    -- NF80 - ENTRADA - Jul/25
    ('NF000080','2025-07-08','2025-08-05',79000.00,'ENTRADA','PENDENTE','85678901000160','99999999999','VENDA DE PRODUTOS','Venda de milho - Graneleiro Sul'),

    -- NF81 a NF200: 120 registros adicionais, seguindo a lógica de distribuição de tipos, valores e datas

    -- Distribuição de 120 registros: 12 ENTRADAS, 108 SAÍDAS.
    -- Para os 108 SAÍDAS, 12 para cada classificação de despesa.

    -- Sequência de Saídas (repetida 12 vezes para cobrir 108 registros): Fertilizantes, Sementes, Defensivos, Combustível, Manutenção, Mão de Obra, Energia, Água, Telefone/Internet, Consultoria.
    -- Sequência de Entradas (intercalada): 1 a cada 10 saídas.
    
    -- 1ª repetição de 10 SAÍDAS + 1 ENTRADA (NF81 a NF91)
    ('NF000081','2025-06-10','2025-07-15',11500.00,'SAIDA','PENDENTE','56473829000145','11012345678','FERTILIZANTES','Adubo NPK 10-10-10 para manutenção'),
    ('NF000082','2025-06-11','2025-07-15',6950.00,'SAIDA','PENDENTE','85236974000121','11123456789','SEMENTES','Sementes de milheto'),
    ('NF000083','2025-06-12','2025-07-15',4500.00,'SAIDA','PENDENTE','96385274000133','11234567890','DEFENSIVOS','Herbicida pós-emergente'),
    ('NF000084','2025-06-13','2025-07-10',3000.00,'SAIDA','PAGO','32165498000175','11345678901','COMBUSTÍVEL','Diesel para aplicação de insumos'),
    ('NF000085','2025-06-14','2025-07-05',2100.00,'SAIDA','PAGO','14725836000190','11456789012','MANUTENÇÃO E OPERAÇÃO','Revisão de pulverizador'),
    ('NF000086','2025-06-15','2025-06-30',15000.00,'SAIDA','PAGO','14927382000160','11567890123','MÃO DE OBRA','Salário e encargos - junho'),
    ('NF000087','2025-05-16','2025-05-30',950.00,'SAIDA','VENCIDO','78945612000108','11678901234','ENERGIA ELÉTRICA','Energia elétrica - maio'),
    ('NF000088','2025-05-16','2025-05-30',135.00,'SAIDA','PAGO','14796325800037','11789012345','ÁGUA','Serviço de água - maio'),
    ('NF000089','2025-05-17','2025-05-25',210.00,'SAIDA','PAGO','95175382000180','11890123456','TELEFONE/INTERNET','Fatura de internet - maio'),
    ('NF000090','2025-05-18','2025-06-05',1850.00,'SAIDA','PENDENTE','75395148000159','11901234567','CONSULTORIA','Acompanhamento de plantio'),
    ('NF000091','2025-05-19','2025-06-15',88000.00,'ENTRADA','PENDENTE','86789012000170','99999999999','VENDA DE PRODUTOS','Venda de milho - Mercado de Grãos Cerrado'),
    
    -- 2ª repetição de 10 SAÍDAS + 1 ENTRADA (NF92 a NF102)
    ('NF000092','2025-04-20','2025-05-30',12500.00,'SAIDA','PENDENTE','56473829000145','10123456789','FERTILIZANTES','Adubação de pastagem'),
    ('NF000093','2025-04-21','2025-05-30',7200.00,'SAIDA','PENDENTE','85236974000121','10234567890','SEMENTES','Sementes de girassol'),
    ('NF000094','2025-04-22','2025-05-30',5900.00,'SAIDA','PENDENTE','96385274000133','10345678901','DEFENSIVOS','Inseticida para lagarta do cartucho'),
    ('NF000095','2025-04-23','2025-05-25',3500.00,'SAIDA','PENDENTE','32165498000175','10456789012','COMBUSTÍVEL','Diesel para manutenção de estradas'),
    ('NF000096','2025-04-24','2025-05-15',2500.00,'SAIDA','PAGO','14725836000190','10567890123','MANUTENÇÃO E OPERAÇÃO','Reparo em cerca e curral'),
    ('NF000097','2025-03-25','2025-04-10',14000.00,'SAIDA','PAGO','14927382000160','10678901234','MÃO DE OBRA','Salário e encargos - março'),
    ('NF000098','2025-03-26','2025-04-05',790.00,'SAIDA','PAGO','78945612000108','10789012345','ENERGIA ELÉTRICA','Energia elétrica - março'),
    ('NF000099','2025-03-26','2025-04-05',115.00,'SAIDA','PAGO','14796325800037','10890123456','ÁGUA','Serviço de água - março'),
    ('NF000100','2025-03-27','2025-04-05',205.00,'SAIDA','PAGO','95175382000180','10901234567','TELEFONE/INTERNET','Fatura de internet - março'),
    ('NF000101','2025-03-28','2025-04-15',1900.00,'SAIDA','PENDENTE','75395148000159','11012345678','CONSULTORIA','Recomendação de manejo do solo'),
    ('NF000102','2025-03-29','2025-04-20',92000.00,'ENTRADA','PAGO','87890123000180','11123456789','VENDA DE PRODUTOS','Venda de milho - Coopergrãos Vale do Ivaí'),

    -- Os 13 repetições seguintes (NF103 a NF200) seguem o mesmo padrão de NF, valor e data sequencial/aleatória.
    
    -- 3ª repetição (NF103 a NF113)
    ('NF000103','2025-02-01','2025-03-15',13500.00,'SAIDA','PENDENTE','56473829000145','11234567890','FERTILIZANTES','Ureia para cobertura final'),
    ('NF000104','2025-02-02','2025-03-15',8800.00,'SAIDA','PENDENTE','85236974000121','11345678901','SEMENTES','Sementes de milho P30F53VYHR'),
    ('NF000105','2025-02-03','2025-03-15',6500.00,'SAIDA','PENDENTE','96385274000133','11456789012','DEFENSIVOS','Fungicida multissítio'),
    ('NF000106','2025-02-04','2025-03-10',4100.00,'SAIDA','PENDENTE','32165498000175','11567890123','COMBUSTÍVEL','Diesel para pulverização'),
    ('NF000107','2025-02-05','2025-03-05',3100.00,'SAIDA','PAGO','14725836000190','11678901234','MANUTENÇÃO E OPERAÇÃO','Conserto de bomba de água'),
    ('NF000108','2025-01-06','2025-01-30',14800.00,'SAIDA','PAGO','14927382000160','11789012345','MÃO DE OBRA','Salário e encargos - fevereiro'),
    ('NF000109','2025-01-07','2025-01-30',820.00,'SAIDA','PAGO','78945612000108','11890123456','ENERGIA ELÉTRICA','Energia elétrica - fevereiro'),
    ('NF000110','2025-01-07','2025-01-30',122.00,'SAIDA','PAGO','14796325800037','11901234567','ÁGUA','Serviço de água - fevereiro'),
    ('NF000111','2025-01-08','2025-01-25',215.00,'SAIDA','PAGO','95175382000180','10123456789','TELEFONE/INTERNET','Fatura de internet - fevereiro'),
    ('NF000112','2025-01-09','2025-02-10',2050.00,'SAIDA','PENDENTE','75395148000159','10234567890','CONSULTORIA','Revisão do planejamento da safra'),
    ('NF000113','2025-01-10','2025-02-20',98000.00,'ENTRADA','PAGO','88901234000190','10345678901','VENDA DE PRODUTOS','Venda de soja - Cerealista Boa Colheita'),

    -- 4ª repetição (NF114 a NF124) - Mantendo a alternância de Faturado/Cliente e Fornecedor
    ('NF000114','2025-10-15','2025-11-30',10900.00,'SAIDA','PENDENTE','56473829000145','10456789012','FERTILIZANTES','Adubo foliar para milho'),
    ('NF000115','2025-10-16','2025-11-30',6800.00,'SAIDA','PENDENTE','85236974000121','10567890123','SEMENTES','Sementes de azevém para cobertura'),
    ('NF000116','2025-09-20','2025-10-30',4700.00,'SAIDA','PENDENTE','96385274000133','10678901234','DEFENSIVOS','Herbicida pré-emergente'),
    ('NF000117','2025-09-21','2025-10-30',3250.00,'SAIDA','PENDENTE','32165498000175','10789012345','COMBUSTÍVEL','Diesel para trator (preparo do solo)'),
    ('NF000118','2025-09-22','2025-10-20',2350.00,'SAIDA','PAGO','14725836000190','10890123456','MANUTENÇÃO E OPERAÇÃO','Revisão de grades e subsolador'),
    ('NF000119','2025-09-23','2025-10-10',16000.00,'SAIDA','PAGO','14927382000160','10901234567','MÃO DE OBRA','Salário e encargos - setembro'),
    ('NF000120','2025-08-24','2025-09-05',910.00,'SAIDA','PAGO','78945612000108','11012345678','ENERGIA ELÉTRICA','Energia elétrica - setembro'),
    ('NF000121','2025-08-24','2025-09-05',145.00,'SAIDA','PAGO','14796325800037','11123456789','ÁGUA','Serviço de água - setembro'),
    ('NF000122','2025-08-25','2025-09-05',200.00,'SAIDA','PAGO','95175382000180','11234567890','TELEFONE/INTERNET','Fatura de internet - setembro'),
    ('NF000123','2025-08-26','2025-09-15',1700.00,'SAIDA','PENDENTE','75395148000159','11345678901','CONSULTORIA','Recomendação de época de plantio'),
    ('NF000124','2025-08-27','2025-09-20',75000.00,'ENTRADA','PENDENTE','80123456000110','11456789012','VENDA DE PRODUTOS','Venda de trigo - Armazém São João'),

    -- 5ª repetição (NF125 a NF135)
    ('NF000125','2025-07-28','2025-08-30',13900.00,'SAIDA','PENDENTE','56473829000145','11567890123','FERTILIZANTES','Fosfato bicálcico'),
    ('NF000126','2025-07-29','2025-08-30',7150.00,'SAIDA','PENDENTE','85236974000121','11678901234','SEMENTES','Sementes de leguminosa para adubação verde'),
    ('NF000127','2025-07-30','2025-08-30',5200.00,'SAIDA','PENDENTE','96385274000133','11789012345','DEFENSIVOS','Acaricida para controle de ácaros'),
    ('NF000128','2025-07-31','2025-08-25',3600.00,'SAIDA','PENDENTE','32165498000175','11890123456','COMBUSTÍVEL','Diesel para secador de grãos'),
    ('NF000129','2025-06-01','2025-07-20',1950.00,'SAIDA','PAGO','14725836000190','11901234567','MANUTENÇÃO E OPERAÇÃO','Conserto de balança rodoviária'),
    ('NF000130','2025-06-02','2025-07-15',15500.00,'SAIDA','PAGO','14927382000160','10123456789','MÃO DE OBRA','Salário e encargos - julho'),
    ('NF000131','2025-05-03','2025-05-25',980.00,'SAIDA','PAGO','78945612000108','10234567890','ENERGIA ELÉTRICA','Energia elétrica - junho'),
    ('NF000132','2025-05-03','2025-05-25',155.00,'SAIDA','PAGO','14796325800037','10345678901','ÁGUA','Serviço de água - junho'),
    ('NF000133','2025-05-04','2025-05-20',219.00,'SAIDA','PAGO','95175382000180','10456789012','TELEFONE/INTERNET','Fatura de internet - junho'),
    ('NF000134','2025-05-05','2025-06-10',1650.00,'SAIDA','PENDENTE','75395148000159','10567890123','CONSULTORIA','Avaliação de plantio de milho'),
    ('NF000135','2025-05-06','2025-06-20',84000.00,'ENTRADA','PAGO','81234567000120','10678901234','VENDA DE PRODUTOS','Venda de trigo - Cerealista Campo Verde'),

    -- 6ª repetição (NF136 a NF146)
    ('NF000136','2025-04-07','2025-05-20',11200.00,'SAIDA','PENDENTE','56473829000145','10789012345','FERTILIZANTES','Fosfato natural para plantio'),
    ('NF000137','2025-04-08','2025-05-20',6450.00,'SAIDA','PENDENTE','85236974000121','10890123456','SEMENTES','Sementes de milho AG9000'),
    ('NF000138','2025-04-09','2025-05-20',5700.00,'SAIDA','PENDENTE','96385274000133','10901234567','DEFENSIVOS','Herbicida para mato-grosso'),
    ('NF000139','2025-04-10','2025-05-15',3350.00,'SAIDA','PENDENTE','32165498000175','11012345678','COMBUSTÍVEL','Diesel para caminhão de frete'),
    ('NF000140','2025-03-11','2025-04-10',2600.00,'SAIDA','PAGO','14725836000190','11123456789','MANUTENÇÃO E OPERAÇÃO','Troca de óleo e filtros do gerador'),
    ('NF000141','2025-03-12','2025-03-30',14500.00,'SAIDA','PAGO','14927382000160','11234567890','MÃO DE OBRA','Salário e encargos - abril'),
    ('NF000142','2025-02-13','2025-03-05',890.00,'SAIDA','PAGO','78945612000108','11345678901','ENERGIA ELÉTRICA','Energia elétrica - março'),
    ('NF000143','2025-02-13','2025-03-05',128.00,'SAIDA','PAGO','14796325800037','11456789012','ÁGUA','Serviço de água - março'),
    ('NF000144','2025-02-14','2025-03-05',195.00,'SAIDA','PAGO','95175382000180','11567890123','TELEFONE/INTERNET','Fatura de internet - março'),
    ('NF000145','2025-02-15','2025-03-15',1800.00,'SAIDA','PENDENTE','75395148000159','11678901234','CONSULTORIA','Análise de viabilidade de irrigação'),
    ('NF000146','2025-02-16','2025-03-20',78000.00,'ENTRADA','PENDENTE','89012345000199','11789012345','VENDA DE PRODUTOS','Venda de milho - Cooperativa de Produtores Rurais do Vale'),

    -- 7ª repetição (NF147 a NF157)
    ('NF000147','2025-01-17','2025-02-28',12100.00,'SAIDA','PENDENTE','56473829000145','11890123456','FERTILIZANTES','Sulfato de amônio'),
    ('NF000148','2025-01-18','2025-02-28',8300.00,'SAIDA','PENDENTE','85236974000121','11901234567','SEMENTES','Sementes de capim massai'),
    ('NF000149','2025-01-19','2025-02-28',6050.00,'SAIDA','PENDENTE','96385274000133','10123456789','DEFENSIVOS','Cupinicida para estruturas'),
    ('NF000150','2025-01-20','2025-02-25',4050.00,'SAIDA','PAGO','32165498000175','10234567890','COMBUSTÍVEL','Diesel para preparo da terra'),
    ('NF000151','2025-10-21','2025-11-15',2800.00,'SAIDA','PAGO','14725836000190','10345678901','MANUTENÇÃO E OPERAÇÃO','Compra de peças de reposição'),
    ('NF000152','2025-10-22','2025-11-10',15200.00,'SAIDA','PENDENTE','14927382000160','10456789012','MÃO DE OBRA','Salário e encargos - outubro'),
    ('NF000153','2025-09-23','2025-10-05',940.00,'SAIDA','PAGO','78945612000108','10567890123','ENERGIA ELÉTRICA','Energia elétrica - outubro'),
    ('NF000154','2025-09-23','2025-10-05',130.00,'SAIDA','PAGO','14796325800037','10678901234','ÁGUA','Serviço de água - outubro'),
    ('NF000155','2025-09-24','2025-10-05',209.00,'SAIDA','PAGO','95175382000180','10789012345','TELEFONE/INTERNET','Fatura de internet - outubro'),
    ('NF000156','2025-09-25','2025-10-15',1950.00,'SAIDA','PENDENTE','75395148000159','10890123456','CONSULTORIA','Avaliação fitossanitária'),
    ('NF000157','2025-09-26','2025-10-30',91000.00,'ENTRADA','PENDENTE','82345678000130','10901234567','VENDA DE PRODUTOS','Venda de soja - Cooperativa AgroNorte'),

    -- 8ª repetição (NF158 a NF168)
    ('NF000158','2025-08-27','2025-09-30',10500.00,'SAIDA','PENDENTE','56473829000145','11012345678','FERTILIZANTES','Cloreto de potássio'),
    ('NF000159','2025-08-28','2025-09-30',7400.00,'SAIDA','PENDENTE','85236974000121','11123456789','SEMENTES','Sementes de milho para silagem'),
    ('NF000160','2025-08-29','2025-09-30',5500.00,'SAIDA','PENDENTE','96385274000133','11234567890','DEFENSIVOS','Adjuvante para calda de pulverização'),
    ('NF000161','2025-07-30','2025-08-25',3800.00,'SAIDA','PENDENTE','32165498000175','11345678901','COMBUSTÍVEL','Diesel para ensiladeira'),
    ('NF000162','2025-07-01','2025-08-15',2100.00,'SAIDA','PAGO','14725836000190','11456789012','MANUTENÇÃO E OPERAÇÃO','Manutenção em colhedora de forragem'),
    ('NF000163','2025-07-02','2025-07-30',14200.00,'SAIDA','PAGO','14927382000160','11567890123','MÃO DE OBRA','Salário e encargos - agosto'),
    ('NF000164','2025-06-03','2025-06-25',850.00,'SAIDA','PAGO','78945612000108','11678901234','ENERGIA ELÉTRICA','Energia elétrica - julho'),
    ('NF000165','2025-06-03','2025-06-25',110.00,'SAIDA','PAGO','14796325800037','11789012345','ÁGUA','Serviço de água - julho'),
    ('NF000166','2025-06-04','2025-06-20',220.00,'SAIDA','PAGO','95175382000180','11890123456','TELEFONE/INTERNET','Fatura de internet - julho'),
    ('NF000167','2025-06-05','2025-07-10',1750.00,'SAIDA','PENDENTE','75395148000159','11901234567','CONSULTORIA','Orientação sobre colheita'),
    ('NF000168','2025-06-06','2025-07-20',81500.00,'ENTRADA','PENDENTE','83456789000140','10123456789','VENDA DE PRODUTOS','Venda de milho - Comércio de Grãos Oeste'),

    -- 9ª repetição (NF169 a NF179)
    ('NF000169','2025-05-07','2025-06-15',12900.00,'SAIDA','PENDENTE','56473829000145','10234567890','FERTILIZANTES','Gesso agrícola'),
    ('NF000170','2025-05-08','2025-06-15',6700.00,'SAIDA','PENDENTE','85236974000121','10345678901','SEMENTES','Sementes de crotalária'),
    ('NF000171','2025-05-09','2025-06-15',5950.00,'SAIDA','PENDENTE','96385274000133','10456789012','DEFENSIVOS','Mudas de eucalipto para cerca viva'),
    ('NF000172','2025-05-10','2025-06-05',3550.00,'SAIDA','PENDENTE','32165498000175','10567890123','COMBUSTÍVEL','Diesel para dessecagem'),
    ('NF000173','2025-04-11','2025-05-10',2400.00,'SAIDA','PAGO','14725836000190','10678901234','MANUTENÇÃO E OPERAÇÃO','Serviço de torno e solda'),
    ('NF000174','2025-04-12','2025-04-30',13800.00,'SAIDA','PAGO','14927382000160','10789012345','MÃO DE OBRA','Salário e encargos - maio'),
    ('NF000175','2025-03-13','2025-03-25',915.00,'SAIDA','PAGO','78945612000108','10890123456','ENERGIA ELÉTRICA','Energia elétrica - abril'),
    ('NF000176','2025-03-13','2025-03-25',138.00,'SAIDA','PAGO','14796325800037','10901234567','ÁGUA','Serviço de água - abril'),
    ('NF000177','2025-03-14','2025-03-25',205.00,'SAIDA','PAGO','95175382000180','11012345678','TELEFONE/INTERNET','Fatura de internet - abril'),
    ('NF000178','2025-03-15','2025-04-10',1600.00,'SAIDA','PENDENTE','75395148000159','11123456789','CONSULTORIA','Elaboração de laudo agronômico'),
    ('NF000179','2025-03-16','2025-04-20',90000.00,'ENTRADA','PAGO','84567890000150','11234567890','VENDA DE PRODUTOS','Venda de soja - AgroExport Brasil'),

    -- 10ª repetição (NF180 a NF190)
    ('NF000180','2025-02-17','2025-03-30',11000.00,'SAIDA','PENDENTE','56473829000145','11345678901','FERTILIZANTES','Adubo líquido para irrigação'),
    ('NF000181','2025-02-18','2025-03-30',7900.00,'SAIDA','PENDENTE','85236974000121','11456789012','SEMENTES','Sementes de pastagem perene'),
    ('NF000182','2025-02-19','2025-03-30',6200.00,'SAIDA','PENDENTE','96385274000133','11567890123','DEFENSIVOS','Óleo mineral para aplicação'),
    ('NF000183','2025-02-20','2025-03-25',4300.00,'SAIDA','VENCIDO','32165498000175','11678901234','COMBUSTÍVEL','Diesel para grade aradora'),
    ('NF000184','2025-01-21','2025-02-15',3000.00,'SAIDA','PAGO','14725836000190','11789012345','MANUTENÇÃO E OPERAÇÃO','Aquisição de mangueiras hidráulicas'),
    ('NF000185','2025-01-22','2025-02-10',15100.00,'SAIDA','PAGO','14927382000160','11890123456','MÃO DE OBRA','Salário e encargos - janeiro'),
    ('NF000186','2025-01-23','2025-02-05',870.00,'SAIDA','PAGO','78945612000108','11901234567','ENERGIA ELÉTRICA','Energia elétrica - janeiro'),
    ('NF000187','2025-01-23','2025-02-05',115.00,'SAIDA','PAGO','14796325800037','10123456789','ÁGUA','Serviço de água - janeiro'),
    ('NF000188','2025-01-24','2025-02-05',199.00,'SAIDA','PAGO','95175382000180','10234567890','TELEFONE/INTERNET','Fatura de internet - janeiro'),
    ('NF000189','2025-01-25','2025-02-15',1700.00,'SAIDA','PENDENTE','75395148000159','10345678901','CONSULTORIA','Acompanhamento técnico de plantio'),
    ('NF000190','2025-01-26','2025-03-01',79500.00,'ENTRADA','PENDENTE','85678901000160','10456789012','VENDA DE PRODUTOS','Venda de soja - Graneleiro Sul'),

    -- 11ª repetição (NF191 a NF200) - Fechamento de 200 registros.
    ('NF000191','2025-10-27','2025-11-30',13300.00,'SAIDA','PENDENTE','56473829000145','10567890123','FERTILIZANTES','Adubo micronutrientes'),
    ('NF000192','2025-10-28','2025-11-30',7500.00,'SAIDA','PENDENTE','85236974000121','10678901234','SEMENTES','Sementes de milho para segunda safra'),
    ('NF000193','2025-10-29','2025-11-30',5800.00,'SAIDA','PENDENTE','96385274000133','10789012345','DEFENSIVOS','Regulador de crescimento'),
    ('NF000194','2025-10-30','2025-11-25',3900.00,'SAIDA','PENDENTE','32165498000175','10890123456','COMBUSTÍVEL','Diesel para gerador em tempo de seca'),
    ('NF000195','2025-09-30','2025-10-20',2700.00,'SAIDA','PAGO','14725836000190','10901234567','MANUTENÇÃO E OPERAÇÃO','Reforma de silo de armazenamento'),
    ('NF000196','2025-09-01','2025-09-30',14600.00,'SAIDA','PAGO','14927382000160','11012345678','MÃO DE OBRA','Salário e encargos - novembro'),
    ('NF000197','2025-08-02','2025-08-25',900.00,'SAIDA','PAGO','78945612000108','11123456789','ENERGIA ELÉTRICA','Energia elétrica - agosto'),
    ('NF000198','2025-08-02','2025-08-25',133.00,'SAIDA','PAGO','14796325800037','11234567890','ÁGUA','Serviço de água - agosto'),
    ('NF000199','2025-08-03','2025-08-20',205.00,'SAIDA','PAGO','95175382000180','11345678901','TELEFONE/INTERNET','Fatura de internet - agosto'),
    ('NF000200','2025-08-04','2025-09-10',86000.00,'ENTRADA','PENDENTE','86789012000170','11456789012','VENDA DE PRODUTOS','Venda de milho - Mercado de Grãos Cerrado')
)
INSERT INTO MovimentoContas (numero_documento, data_emissao, data_vencimento, valor_total, tipo_movimento, status_pagamento, descricao, fornecedor_id, faturado_id)
SELECT v_additional.nf, v_additional.emissao::date, v_additional.venc::date, v_additional.valor_total, v_additional.tipo_mov, v_additional.status, v_additional.desc_base, pf.id, ft.id
FROM v_additional
JOIN Pessoas pf ON 
    (v_additional.tipo_mov = 'SAIDA' AND pf.documento = v_additional.fornecedor_doc) OR 
    (v_additional.tipo_mov = 'ENTRADA' AND pf.documento = v_additional.fornecedor_doc)
JOIN Pessoas ft ON ft.documento = v_additional.faturado_doc
WHERE NOT EXISTS (
    SELECT 1 FROM MovimentoContas mm WHERE mm.numero_documento = v_additional.nf
);

INSERT INTO ParcelasContas (movimento_id, numero_parcela, data_vencimento, valor_parcela)
SELECT m.id, 1, m.data_vencimento, m.valor_total
FROM MovimentoContas m
WHERE m.numero_documento LIKE 'NF%'
ON CONFLICT DO NOTHING;

WITH v_additional(nf, emissao, venc, valor_total, tipo_mov, status, fornecedor_doc, faturado_doc, class_desc, desc_base) AS (
    VALUES
    ('NF000051','2025-09-01','2025-10-30',15100.00,'SAIDA','PENDENTE','56473829000145','10123456789','FERTILIZANTES','Compra de NPK 05-25-25 para plantio de inverno'),
    ('NF000052','2025-09-02','2025-10-30',8120.00,'SAIDA','PENDENTE','85236974000121','10234567890','SEMENTES','Sementes de forrageira para rotação'),
    ('NF000053','2025-08-03','2025-09-30',5750.00,'SAIDA','PENDENTE','96385274000133','10345678901','DEFENSIVOS','Insumo para controle de percevejo na soja'),
    ('NF000054','2025-08-04','2025-09-25',3950.00,'SAIDA','VENCIDO','32165498000175','10456789012','COMBUSTÍVEL','Óleo diesel para tratores - mês de agosto'),
    ('NF000055','2025-07-05','2025-08-20',1900.00,'SAIDA','PAGO','14725836000190','10567890123','MANUTENÇÃO E OPERAÇÃO','Reparo em sistema hidráulico do pulverizador'),
    ('NF000056','2025-07-06','2025-07-30',920.50,'SAIDA','PAGO','78945612000108','10678901234','ENERGIA ELÉTRICA','Energia elétrica - galpão e escritório - julho'),
    ('NF000057','2025-07-06','2025-07-30',150.00,'SAIDA','PAGO','14796325800037','10789012345','ÁGUA','Consumo de água - julho/2025'),
    ('NF000058','2025-07-07','2025-07-20',220.00,'SAIDA','PAGO','95175382000180','10890123456','TELEFONE/INTERNET','Fatura de internet/telefone - julho'),
    ('NF000059','2025-06-08','2025-07-10',1700.00,'SAIDA','PENDENTE','75395148000159','10901234567','CONSULTORIA','Monitoramento e controle de doenças no trigo'),
    ('NF000060','2025-06-09','2025-07-05',85000.00,'ENTRADA','PAGO','83456789000140','99999999999','VENDA DE PRODUTOS','Venda de trigo safra inverno'),
    ('NF000061','2025-05-10','2025-05-30',15000.00,'SAIDA','PAGO','14927382000160','11012345678','MÃO DE OBRA','Salário e encargos funcionário rural - maio'),
    ('NF000062','2025-05-11','2025-06-30',13800.00,'SAIDA','PENDENTE','56473829000145','11123456789','FERTILIZANTES','Calcário dolomítico para correção de solo'),
    ('NF000063','2025-04-12','2025-05-30',7550.00,'SAIDA','PENDENTE','85236974000121','11234567890','SEMENTES','Sementes de aveia preta'),
    ('NF000064','2025-04-13','2025-05-30',6100.00,'SAIDA','PENDENTE','96385274000133','11345678901','DEFENSIVOS','Dessecante final para colheita de milho'),
    ('NF000065','2025-03-14','2025-04-20',4500.00,'SAIDA','PAGO','32165498000175','11456789012','COMBUSTÍVEL','Abastecimento para colheita e transporte'),
    ('NF000066','2025-03-15','2025-04-05',2850.00,'SAIDA','PAGO','14725836000190','11567890123','MANUTENÇÃO E OPERAÇÃO','Revisão geral do caminhão de transporte'),
    ('NF000067','2025-02-16','2025-03-05',1050.00,'SAIDA','VENCIDO','78945612000108','11678901234','ENERGIA ELÉTRICA','Energia elétrica (alta estação) - fevereiro'),
    ('NF000068','2025-02-16','2025-03-05',175.00,'SAIDA','PAGO','14796325800037','11789012345','ÁGUA','Serviço de água - fevereiro'),
    ('NF000069','2025-02-17','2025-02-25',199.90,'SAIDA','PAGO','95175382000180','11890123456','TELEFONE/INTERNET','Fatura de internet/telefone - fevereiro'),
    ('NF000070','2025-02-18','2025-03-10',95000.00,'ENTRADA','PENDENTE','84567890000150','11901234567','VENDA DE PRODUTOS','Venda de soja antecipada - AgroExport Brasil'),
    ('NF000071','2025-01-19','2025-02-10',2100.00,'SAIDA','PENDENTE','75395148000159','10123456789','CONSULTORIA','Análise e planejamento da safra de verão'),
    ('NF000072','2025-01-20','2025-01-30',14500.00,'SAIDA','PAGO','14927382000160','10234567890','MÃO DE OBRA','Salário e encargos funcionário rural - janeiro'),
    ('NF000073','2025-10-01','2025-11-20',11900.00,'SAIDA','PENDENTE','56473829000145','10345678901','FERTILIZANTES','Superfosfato triplo para adubação de base'),
    ('NF000074','2025-10-02','2025-11-20',7300.00,'SAIDA','PENDENTE','85236974000121','10456789012','SEMENTES','Sementes de sorgo para safrinha'),
    ('NF000075','2025-09-03','2025-10-15',4800.00,'SAIDA','PENDENTE','96385274000133','10567890123','DEFENSIVOS','Fungicida para ferrugem asiática'),
    ('NF000076','2025-09-04','2025-10-15',3300.00,'SAIDA','PENDENTE','32165498000175','10678901234','COMBUSTÍVEL','Diesel para aplicação de defensivos'),
    ('NF000077','2025-08-05','2025-09-05',2600.00,'SAIDA','PAGO','14725836000190','10789012345','MANUTENÇÃO E OPERAÇÃO','Troca de pneus do trator de menor porte'),
    ('NF000078','2025-08-06','2025-08-25',850.00,'SAIDA','PAGO','78945612000108','10890123456','ENERGIA ELÉTRICA','Energia elétrica - agosto'),
    ('NF000079','2025-07-07','2025-07-20',120.00,'SAIDA','PAGO','14796325800037','10901234567','ÁGUA','Serviço de água - julho'),
    ('NF000080','2025-07-08','2025-08-05',79000.00,'ENTRADA','PENDENTE','85678901000160','99999999999','VENDA DE PRODUTOS','Venda de milho - Graneleiro Sul')
)
INSERT INTO MovimentoContas_has_Classificacao (movimento_id, classificacao_id, valor_classificacao, percentual, justificativa)
SELECT m.id, c.id, m.valor_total, 100.00, 'Classificação conforme descrição da NF'
FROM MovimentoContas m
JOIN v_additional ON v_additional.nf = m.numero_documento
JOIN Classificacao c ON c.descricao = v_additional.class_desc
ON CONFLICT DO NOTHING;

COMMIT;
