-- Insert default Mapbox token setting
INSERT INTO public.app_settings (setting_key, setting_value, description)
VALUES ('mapbox_token', 'pk.eyJ1IjoianVkZWNoLTEyMyIsImEiOiJjbWoyZWllbTIwc2M3M2VzZnphMXg1cXB0In0.B8GQTPB6SuZblGMwGU4wJA', 'Mapbox public access token for map rendering')
ON CONFLICT (setting_key) DO NOTHING;
