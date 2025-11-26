BEGIN;
TRUNCATE TABLE movimentocontas_has_classificacao, parcelascontas, movimentocontas, pessoas, classificacao RESTART IDENTITY CASCADE;
COMMIT;
