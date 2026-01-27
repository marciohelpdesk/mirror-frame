-- Adicionar colunas para janela de horário e URL do relatório
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS checkout_time TEXT,
ADD COLUMN IF NOT EXISTS checkin_deadline TEXT,
ADD COLUMN IF NOT EXISTS report_pdf_url TEXT;

-- Comentários descritivos
COMMENT ON COLUMN jobs.checkout_time IS 'Guest checkout time - when cleaning can start';
COMMENT ON COLUMN jobs.checkin_deadline IS 'Next guest check-in time - cleaning deadline';
COMMENT ON COLUMN jobs.report_pdf_url IS 'URL to saved PDF report in storage';