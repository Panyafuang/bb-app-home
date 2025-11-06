--
-- PostgreSQL database dump
--

\restrict d5UuwVhG50z9FIg6eVKDa9jLae346XQCVBIyrP5q8zFBvidY4FlpDUwMadDQDqe

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP TRIGGER IF EXISTS update_gold_record_updated_at ON public.gold_record;
DROP INDEX IF EXISTS public.idx_gold_record_timestamp;
DROP INDEX IF EXISTS public.idx_gold_record_reference;
DROP INDEX IF EXISTS public.idx_gold_record_net_gold;
DROP INDEX IF EXISTS public.idx_gold_record_ledger;
DROP INDEX IF EXISTS public.idx_gold_record_gold_out;
DROP INDEX IF EXISTS public.idx_gold_record_category;
ALTER TABLE IF EXISTS ONLY public.gold_record DROP CONSTRAINT IF EXISTS gold_record_pkey;
DROP TABLE IF EXISTS public.gold_record;
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP TYPE IF EXISTS public.category_enum;
DROP EXTENSION IF EXISTS "uuid-ossp";
--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: category_enum; Type: TYPE; Schema: public; Owner: bb_user
--

CREATE TYPE public.category_enum AS ENUM (
    'Beauty Bijoux',
    'PV fine',
    'PV green',
    'PV Accessories'
);


ALTER TYPE public.category_enum OWNER TO bb_user;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: bb_user
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO bb_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: gold_record; Type: TABLE; Schema: public; Owner: bb_user
--

CREATE TABLE public.gold_record (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    timestamp_tz timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reference_number character varying(100) NOT NULL,
    details text,
    gold_in_grams numeric(10,3) NOT NULL,
    remarks text,
    category public.category_enum NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    gold_out_grams numeric(10,3) DEFAULT 0,
    net_gold_grams numeric(10,3) GENERATED ALWAYS AS ((gold_in_grams - gold_out_grams)) STORED,
    calculated_loss numeric(10,2),
    ledger character varying(20),
    CONSTRAINT gold_record_gold_in_grams_check CHECK ((gold_in_grams >= (0)::numeric)),
    CONSTRAINT gold_record_gold_out_grams_check CHECK ((gold_out_grams >= (0)::numeric)),
    CONSTRAINT gold_record_ledger_check CHECK (((ledger)::text = ANY ((ARRAY['Beauty Bijoux'::character varying, 'Green Gold'::character varying, 'Palladium'::character varying, 'Platinum'::character varying, 'PV Accessories'::character varying, 'PV Fine Gold'::character varying])::text[])))
);


ALTER TABLE public.gold_record OWNER TO bb_user;

--
-- Name: COLUMN gold_record.calculated_loss; Type: COMMENT; Schema: public; Owner: bb_user
--

COMMENT ON COLUMN public.gold_record.calculated_loss IS 'Calculated loss in grams (numeric with 2 decimal places)';


--
-- Name: COLUMN gold_record.ledger; Type: COMMENT; Schema: public; Owner: bb_user
--

COMMENT ON COLUMN public.gold_record.ledger IS 'Ledger category: Beauty Bijoux, Green Gold, Palladium, Platinum, PV Accessories, PV Fine Gold';


--
-- Data for Name: gold_record; Type: TABLE DATA; Schema: public; Owner: bb_user
--

COPY public.gold_record (id, timestamp_tz, reference_number, details, gold_in_grams, remarks, category, created_at, updated_at, gold_out_grams, calculated_loss, ledger) FROM stdin;
024a4861-80ef-4dfb-b7c2-17eb1aef1210	2024-10-30 11:00:00+01	Delivery note 3007011	Shipped samples to QI (Bangkok)	0.000		Beauty Bijoux	2025-10-07 10:40:35.555222+02	2025-10-07 10:46:58.489605+02	7.970	0.10	Beauty Bijoux
04dec595-f724-41aa-b723-ed840736227f	2024-12-12 11:00:00+01	LS/058	Local sale	0.000		Beauty Bijoux	2025-10-07 10:40:35.674218+02	2025-10-07 10:46:58.489605+02	1.710	0.10	Beauty Bijoux
3eab0f33-1b4a-4adb-8b96-0299f8698203	2025-03-26 11:00:00+01	LS/074	Local sale	0.000		Beauty Bijoux	2025-10-07 10:40:35.866679+02	2025-10-07 10:57:35.779512+02	3.150	0.10	Beauty Bijoux
a219a07a-6bcb-425f-8fdc-88d3403a7545	2025-05-23 12:00:00+02	Inv. 0192501	Charged SPRUE 375/-	0.000		Beauty Bijoux	2025-10-07 10:40:36.058284+02	2025-10-07 10:57:35.779512+02	1.910	0.10	Beauty Bijoux
b0fe7c90-1bf2-479a-8156-be6ffe83db66	2025-03-26 11:00:00+01	LS/073	Local sale	0.000		Beauty Bijoux	2025-10-07 10:40:35.865477+02	2025-10-07 10:57:35.779512+02	1.840	0.10	Beauty Bijoux
c7214560-debd-4902-80b5-e50976405656	2025-03-26 11:00:00+01	LS/074	Local sale	0.000		Beauty Bijoux	2025-10-07 10:40:35.868956+02	2025-10-07 10:57:35.779512+02	1.780	0.10	Beauty Bijoux
ce9b3169-e7ed-49e7-b333-2a39603ca2c5	2025-06-04 12:00:00+02	LS/094	Local sale	0.000		Beauty Bijoux	2025-10-07 10:40:36.070309+02	2025-10-07 10:57:35.779512+02	1.120	0.10	Beauty Bijoux
d3137a8c-562f-48d2-9959-eb8bbc72550c	2025-03-26 11:00:00+01	LS/074	Local sale	0.000		Beauty Bijoux	2025-10-07 10:40:35.867751+02	2025-10-07 10:57:35.779512+02	3.250	0.10	Beauty Bijoux
359932f2-7249-4b6e-b942-cb2940fa841b	2024-08-21 12:00:00+02	LS/040	Local sale	0.000		Beauty Bijoux	2025-10-07 10:40:35.354916+02	2025-10-07 10:57:35.779512+02	10.700	0.10	Beauty Bijoux
e87d0455-7d9a-4788-a1bd-2b9f40867627	2024-08-13 12:00:00+02	LS/039	Local sale	0.000		Beauty Bijoux	2025-10-07 10:40:35.345+02	2025-10-07 10:57:35.779512+02	5.280	0.10	Beauty Bijoux
64733248-26c2-4a40-91f8-d7e16472381f	2024-08-01 12:00:00+02	IV2408-004	Purchased K18WGPD1.25 Lavalier Crown with Silicone "Paspaley" from Nakagawa	13.080		Beauty Bijoux	2025-10-07 10:40:35.308429+02	2025-10-07 10:40:35.308429+02	0.000	\N	Beauty Bijoux
6cdf065f-9e96-4d43-b51e-b8372ec41a89	2024-08-05 12:00:00+02	Inv. 24004455	Purchased 750S2 WG from Umicore	75.000		Beauty Bijoux	2025-10-07 10:40:35.318991+02	2025-10-07 10:40:35.318991+02	0.000	\N	Beauty Bijoux
f22aad88-14a6-49b0-81c2-fe60098e1c4e	2024-08-06 12:00:00+02	Inv. 106524	Received accessories from Germany	49.690		Beauty Bijoux	2025-10-07 10:40:35.328166+02	2025-10-07 10:40:35.328166+02	0.000	\N	Beauty Bijoux
b1f27224-e498-417b-b7bc-4cb70fc44cf7	2024-08-07 12:00:00+02	30102298/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.329579+02	2025-10-07 10:40:35.329579+02	17.990	0.00	Beauty Bijoux
f9a5fd30-e8f3-4277-912c-f96379c0fb6b	2024-08-07 12:00:00+02	30102299/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.330892+02	2025-10-07 10:40:35.330892+02	6.010	0.00	Beauty Bijoux
3c61e0d2-d9b2-4bad-a0a5-0ffa3c650582	2024-08-07 12:00:00+02	30102300/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.331952+02	2025-10-07 10:40:35.331952+02	3.480	0.00	Beauty Bijoux
5c0a28d2-d9c1-4247-84e8-44457ba571cb	2024-08-09 12:00:00+02	Inv. 00424MAC	Export to Maxi-Cash by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.332982+02	2025-10-07 10:40:35.332982+02	117.170	0.10	Beauty Bijoux
8e70c1f5-a8fa-4ded-a21f-0dc1ad8c625d	2024-08-09 12:00:00+02	Inv. 00524MAC	Export to Maxi-Cash by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.33404+02	2025-10-07 10:40:35.33404+02	81.250	0.10	Beauty Bijoux
2ccf4b5f-f13a-485e-9e81-e24383a6dd0e	2024-08-10 12:00:00+02	Inv. 0302401	Charged accessories 585/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.335189+02	2025-10-07 10:40:35.335189+02	0.230	\N	Beauty Bijoux
c0435536-1909-4d00-959a-886624c36a5f	2024-08-10 12:00:00+02	Inv. 0302401	Charged accessories 750/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.336441+02	2025-10-07 10:40:35.336441+02	1.820	\N	Beauty Bijoux
25e0fdbb-6e66-469e-926a-ca7a96888a66	2024-08-10 12:00:00+02	Inv. 1012279	Export to Germany (PD GOLD)	0.000		Beauty Bijoux	2025-10-07 10:40:35.338092+02	2025-10-07 10:40:35.338092+02	3.270	0.10	Beauty Bijoux
56901e45-db26-4c9b-89eb-ff5675aae0bc	2024-08-10 12:00:00+02	Inv. 05724PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.339975+02	2025-10-07 10:40:35.339975+02	3.130	0.10	Beauty Bijoux
898c7a1e-1144-4b5b-bff5-762397e503ee	2024-08-10 12:00:00+02	Inv. 05824PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.341411+02	2025-10-07 10:40:35.341411+02	2.070	0.10	Beauty Bijoux
4687a371-d0f3-4a25-8ea0-715775559fde	2024-08-10 12:00:00+02	Inv. 05924PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.342687+02	2025-10-07 10:40:35.342687+02	2.400	0.10	Beauty Bijoux
e9ab6778-e654-45b4-ac22-ea0b6571967e	2024-08-10 12:00:00+02	Inv. 06024PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.343801+02	2025-10-07 10:40:35.343801+02	0.590	0.10	Beauty Bijoux
124d3288-69f3-49e6-835f-8916acf4cd23	2024-08-15 12:00:00+02	HCR2400089_HFI2400580	Received return consignments 18K from Poh Heng (Inv. 01724PH)	14.270		Beauty Bijoux	2025-10-07 10:40:35.346235+02	2025-10-07 10:40:35.346235+02	0.000	\N	Beauty Bijoux
63b1b333-4d70-41fb-9ddc-6bd574e1b559	2024-08-15 12:00:00+02	HCR2400090_HFI2400686	Received return consignments 18K from Poh Heng (Proforma inv. 23/05-2024)	11.400		Beauty Bijoux	2025-10-07 10:40:35.347335+02	2025-10-07 10:40:35.347335+02	0.000	\N	Beauty Bijoux
3299b5db-95d0-4df5-8e3f-5074d86c3d17	2024-08-15 12:00:00+02	30102546/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.348404+02	2025-10-07 10:40:35.348404+02	1.730	0.00	Beauty Bijoux
ea0d3fff-bac4-464a-81d8-71f5fa91c067	2024-08-15 12:00:00+02	30102614/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.349376+02	2025-10-07 10:40:35.349376+02	0.790	0.00	Beauty Bijoux
106f0b4a-0ae3-4a46-b75f-cb67c15def7b	2024-08-15 12:00:00+02	30102615/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.350342+02	2025-10-07 10:40:35.350342+02	0.960	0.00	Beauty Bijoux
88944fc1-db1e-4216-8f99-22f567226a50	2024-08-15 12:00:00+02	30102616/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.351365+02	2025-10-07 10:40:35.351365+02	0.090	0.00	Beauty Bijoux
3cae0792-9440-4cdf-a292-9c839b9ffc90	2024-08-15 12:00:00+02	30102617/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.352716+02	2025-10-07 10:40:35.352716+02	0.470	0.00	Beauty Bijoux
53c16c3d-faa0-4f23-9ef2-7b4ad84d1a71	2024-08-17 12:00:00+02	Inv. 0312401	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.353897+02	2025-10-07 10:40:35.353897+02	7.580	\N	Beauty Bijoux
6681e4b3-ce4a-4eea-a14a-6a9ec6573dbe	2024-08-23 12:00:00+02	30102115/02/01 30102928/02/01	Refining charged sweep from Umicore	132.860		Beauty Bijoux	2025-10-07 10:40:35.355843+02	2025-10-07 10:40:35.355843+02	0.000	\N	Beauty Bijoux
cbec26df-49c6-47ed-b14c-01466aec2353	2024-08-24 12:00:00+02	Inv. 0322402	Charged accessories 750/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.357042+02	2025-10-07 10:40:35.357042+02	0.270	\N	Beauty Bijoux
b7d6d629-7d41-438e-af1f-f137f1f3d850	2024-08-24 12:00:00+02	Inv. 0322402	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.358421+02	2025-10-07 10:40:35.358421+02	47.280	\N	Beauty Bijoux
2bd1eb37-47b0-4387-a0b5-06bcd99eab30	2024-08-26 12:00:00+02	30103139/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.359503+02	2025-10-07 10:40:35.359503+02	9.900	0.00	Beauty Bijoux
7c0cc3a9-d3d7-4c3d-917e-ace439753af0	2024-08-26 12:00:00+02	30103140/02/01-02	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.360542+02	2025-10-07 10:40:35.360542+02	13.220	0.00	Beauty Bijoux
ac81edea-925b-4754-bea7-abc28ab2450a	2024-08-26 12:00:00+02	30103141/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.361631+02	2025-10-07 10:40:35.361631+02	3.290	0.00	Beauty Bijoux
94784d13-193f-4cf8-a112-fcfd051cf08b	2024-08-26 12:00:00+02	IV2408-054	Purchased K18YG 230SDC4 from Nakagawa	202.590		Beauty Bijoux	2025-10-07 10:40:35.362833+02	2025-10-07 10:40:35.362833+02	0.000	\N	Beauty Bijoux
6b55c281-5149-4826-ad7a-099588e1569c	2024-08-26 12:00:00+02	IV2408-054	Purchased K18WGPd10 230SDC4 from Nakagawa	79.470		Beauty Bijoux	2025-10-07 10:40:35.363965+02	2025-10-07 10:40:35.363965+02	0.000	\N	Beauty Bijoux
c693426d-6725-4e66-a687-e76deea71498	2024-08-26 12:00:00+02	IV2408-054	Purchased K18PG 230SDC4 from Nakagawa	36.520		Beauty Bijoux	2025-10-07 10:40:35.36508+02	2025-10-07 10:40:35.36508+02	0.000	\N	Beauty Bijoux
25dc97ef-f511-402a-aac0-ce0101bcc388	2024-08-26 12:00:00+02	IV2408-054	Purchased K18 Lobster 10mm "P+750" from Nakagawa	21.710		Beauty Bijoux	2025-10-07 10:40:35.366114+02	2025-10-07 10:40:35.366114+02	0.000	\N	Beauty Bijoux
4abd57e5-c063-45a8-bf66-30265dab356d	2024-08-26 12:00:00+02	IV2408-054	Purchased K18WGPD5 Lobster 10mm "P+750" NFRP from Nakagawa	9.780		Beauty Bijoux	2025-10-07 10:40:35.367208+02	2025-10-07 10:40:35.367208+02	0.000	\N	Beauty Bijoux
388b3339-dbba-4b2c-920f-4f70929729d5	2024-08-26 12:00:00+02	IV2408-054	Purchased K18PG Lobster 10mm "P+750" from Nakagawa	4.260		Beauty Bijoux	2025-10-07 10:40:35.368313+02	2025-10-07 10:40:35.368313+02	0.000	\N	Beauty Bijoux
73d094f7-6995-4787-9f04-077a5055125e	2024-08-26 12:00:00+02	IV2408-054	Purchased K18YG LS4mm Slide Bead with PNK-15(V) from Nakagawa	12.420		Beauty Bijoux	2025-10-07 10:40:35.369528+02	2025-10-07 10:40:35.369528+02	0.000	\N	Beauty Bijoux
d6e982ac-1928-4a58-9d7f-652dac9086a0	2024-08-26 12:00:00+02	IV2408-054	Purchased K18WGPd5 LS4mm Slide Bead with PNK-15(V) NFRP from Nakagawa	4.170		Beauty Bijoux	2025-10-07 10:40:35.370799+02	2025-10-07 10:40:35.370799+02	0.000	\N	Beauty Bijoux
21f30630-77b2-4f59-a644-2c5d54f56bf2	2024-08-26 12:00:00+02	IV2408-054	Purchased K18PG LS4mm Slide Bead with PNK-15(V) from Nakagawa	2.280		Beauty Bijoux	2025-10-07 10:40:35.371999+02	2025-10-07 10:40:35.371999+02	0.000	\N	Beauty Bijoux
63917981-2044-4fba-b8bc-f62b8bb99754	2024-08-27 12:00:00+02	Inv. 01524SP	Export to Aspial by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.373093+02	2025-10-07 10:40:35.373093+02	8.580	0.10	Beauty Bijoux
3af2b7e6-918a-4843-a8d2-36d3679176c2	2024-08-27 12:00:00+02	Inv. 01624SP	Export to Aspial by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.374594+02	2025-10-07 10:40:35.374594+02	4.680	0.10	Beauty Bijoux
4a92fa80-439c-4304-a0bc-dd94cfaefdb5	2024-08-27 12:00:00+02	Inv. 01724SP	Export to Aspial by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.375693+02	2025-10-07 10:40:35.375693+02	4.920	0.10	Beauty Bijoux
3bbdc1c4-245f-462d-acd0-87614ab33faa	2024-08-27 12:00:00+02	Inv. 107024	Received fine gold from Germany	5000.000		Beauty Bijoux	2025-10-07 10:40:35.376843+02	2025-10-07 10:40:35.376843+02	0.000	\N	Beauty Bijoux
f5c9df7a-f254-4693-8254-024c3cbdd5a6	2024-08-27 12:00:00+02	Inv. 105924	Received accessories from Germany	94.000		Beauty Bijoux	2025-10-07 10:40:35.378009+02	2025-10-07 10:40:35.378009+02	0.000	\N	Beauty Bijoux
88c5a88a-c381-4703-b3ca-1cd1da60d9de	2024-08-27 12:00:00+02	Inv. 105925	Received gold sheet 375/- from Germany	52.680		Beauty Bijoux	2025-10-07 10:40:35.379461+02	2025-10-07 10:40:35.379461+02	0.000	\N	Beauty Bijoux
9498dffb-1040-49c6-bf63-884ea4ebce05	2024-08-28 12:00:00+02	IV2408-060	Purchased K18 Lobster 10mm "P+750" from Nakagawa	5.430		Beauty Bijoux	2025-10-07 10:40:35.380737+02	2025-10-07 10:40:35.380737+02	0.000	\N	Beauty Bijoux
9e3d4900-9393-4e27-9165-779c9892a453	2024-08-28 12:00:00+02	Inv. 03124PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.381682+02	2025-10-07 10:40:35.381682+02	1226.520	0.10	Beauty Bijoux
6a51aa2d-a42c-493d-888f-38b4815af0f8	2024-08-28 12:00:00+02	Inv. 03224PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.382524+02	2025-10-07 10:40:35.382524+02	2284.150	0.10	Beauty Bijoux
462451e9-a663-4259-8a81-467f50099b75	2024-08-28 12:00:00+02	Inv. 03324PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.383347+02	2025-10-07 10:40:35.383347+02	1176.150	0.10	Beauty Bijoux
ae6f42bd-450e-4bb6-89f7-127881faa50f	2024-08-31 12:00:00+02	Inv. 0332401	Charged gold sheet 585/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.384376+02	2025-10-07 10:40:35.384376+02	0.790	\N	Beauty Bijoux
14f60db6-418c-4a11-82c2-ed7f7afe5f28	2024-08-31 12:00:00+02	Inv. 0332401	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.385344+02	2025-10-07 10:40:35.385344+02	47.250	\N	Beauty Bijoux
9b8de979-122c-480f-8b9f-a924f0743a11	2024-09-03 12:00:00+02	Inv. 107424	Received accessories from Germany	86.840		Beauty Bijoux	2025-10-07 10:40:35.386366+02	2025-10-07 10:40:35.386366+02	0.000	\N	Beauty Bijoux
2306cf9e-0c8b-4036-b68d-96bcd493d3fd	2024-09-05 12:00:00+02	Inv. 03424PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.387552+02	2025-10-07 10:40:35.387552+02	2835.250	0.10	Beauty Bijoux
b8bf1bf6-3a18-4d8a-9de6-d701637f5f8f	2024-09-05 12:00:00+02	Inv. 03524PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.388734+02	2025-10-07 10:40:35.388734+02	27.360	0.10	Beauty Bijoux
ae22591c-4685-43f6-97fa-5254df13ac31	2024-09-05 12:00:00+02	Inv. 03624PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.389721+02	2025-10-07 10:40:35.389721+02	63.360	0.10	Beauty Bijoux
47e5be95-a67c-409f-9b7d-458e9a5e58eb	2024-09-05 12:00:00+02	Inv. 03724PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.390829+02	2025-10-07 10:40:35.390829+02	5.940	0.10	Beauty Bijoux
b71a5dbd-2b8c-4cbc-b4d6-8f2014b428f0	2024-09-05 12:00:00+02	Inv. 03824PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.391903+02	2025-10-07 10:40:35.391903+02	36.560	0.10	Beauty Bijoux
bbe81a9d-cb76-4062-9a76-bb48d9af7535	2024-09-06 12:00:00+02	Inv. 06124PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.392972+02	2025-10-07 10:40:35.392972+02	89.190	0.10	Beauty Bijoux
f6fe62ab-1f3d-46f5-958c-87db6286d129	2024-09-06 12:00:00+02	Inv. 06224PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.394052+02	2025-10-07 10:40:35.394052+02	413.330	0.10	Beauty Bijoux
d1b406eb-e239-4840-b0bf-66d98c46b653	2024-09-06 12:00:00+02	Inv. 06324PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.395047+02	2025-10-07 10:40:35.395047+02	75.610	0.10	Beauty Bijoux
dd1edc54-657d-4983-93f8-2bcbc19f2a49	2024-09-06 12:00:00+02	LS/044	Local sale (Samples 18K to Nagakawa)	2.130		Beauty Bijoux	2025-10-07 10:40:35.396207+02	2025-10-07 10:40:35.396207+02	0.000	\N	Beauty Bijoux
09c9f42b-43e2-4be6-a09f-2d305f262edf	2024-09-07 12:00:00+02	Inv. 0342401	Charged accessories 585/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.397239+02	2025-10-07 10:40:35.397239+02	1.900	\N	Beauty Bijoux
eb41472e-d60a-4958-92bb-ecf799cba958	2024-09-07 12:00:00+02	Inv. 0342401	Charged gold sheet 333/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.398312+02	2025-10-07 10:40:35.398312+02	4.280	\N	Beauty Bijoux
9c91e839-9ad0-456c-8192-2f5b4fed384a	2024-09-09 12:00:00+02	IV2409-019	Purchased K18 Lavalier Crown with Silicone "Paspaley" from Nakagawa	1.540		Beauty Bijoux	2025-10-07 10:40:35.399267+02	2025-10-07 10:40:35.399267+02	0.000	\N	Beauty Bijoux
2b7bf0d6-4bbe-4e1a-9044-16f109352df9	2024-09-09 12:00:00+02	IV2409-019	Purchased K18WGPD1.25 Lavalier Crown with Silicone "Paspaley" NFRP from Nakagawa	1.050		Beauty Bijoux	2025-10-07 10:40:35.400173+02	2025-10-07 10:40:35.400173+02	0.000	\N	Beauty Bijoux
b8abb79f-5301-4901-b516-6e69ea6ae1d8	2024-09-09 12:00:00+02	IV2409-019	Purchased K18PG Lavalier Crown with Silicone "Paspaley" from Nakagawa	6.120		Beauty Bijoux	2025-10-07 10:40:35.401236+02	2025-10-07 10:40:35.401236+02	0.000	\N	Beauty Bijoux
3fc0c799-7695-44e9-86ab-405cbdf98610	2024-09-09 12:00:00+02	Inv. 03924HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.406056+02	2025-10-07 10:40:35.406056+02	185.630	0.10	Beauty Bijoux
d685d4fb-e388-4c33-9a52-e12fda915137	2024-09-10 12:00:00+02	Inv. 107624	Received accessories from Germany	15.710		Beauty Bijoux	2025-10-07 10:40:35.407207+02	2025-10-07 10:40:35.407207+02	0.000	\N	Beauty Bijoux
d675162c-1518-4d6a-82e6-0794141862e2	2024-09-10 12:00:00+02	IV2409-027	Purchased K18 Lavalier Crown with Silicone "Paspaley" from Nakagawa	15.300		Beauty Bijoux	2025-10-07 10:40:35.408067+02	2025-10-07 10:40:35.408067+02	0.000	\N	Beauty Bijoux
7acb053c-9860-4c1b-ac97-8183f5832e83	2024-09-10 12:00:00+02	IV2409-027	Purchased K18WGPD1.25 Lavalier Crown with Silicone "Paspaley" NFRP from Nakagawa	12.000		Beauty Bijoux	2025-10-07 10:40:35.408869+02	2025-10-07 10:40:35.408869+02	0.000	\N	Beauty Bijoux
90bfbc96-6987-483c-8de7-29e60166b75f	2024-09-11 12:00:00+02	Inv. 04024HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.40979+02	2025-10-07 10:40:35.40979+02	103.950	0.10	Beauty Bijoux
0a8f24b1-02e8-47b9-ad60-179b1f6712c7	2024-09-11 12:00:00+02	Inv. 04124HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.410708+02	2025-10-07 10:40:35.410708+02	30.120	0.10	Beauty Bijoux
edffbbe3-87e1-4e0c-ab0c-2531c91775f4	2024-09-11 12:00:00+02	Inv. 04224HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.411777+02	2025-10-07 10:40:35.411777+02	118.800	0.10	Beauty Bijoux
2b88a10c-6da9-4313-916c-acaf6ff8e520	2024-09-11 12:00:00+02	30103980/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.412907+02	2025-10-07 10:40:35.412907+02	15.320	0.00	Beauty Bijoux
3e684100-bd96-43c7-9f4b-ab6b5de774aa	2024-09-11 12:00:00+02	30103983/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.413799+02	2025-10-07 10:40:35.413799+02	8.340	0.00	Beauty Bijoux
2a366612-c3f6-4595-a993-67daf60ad909	2024-09-11 12:00:00+02	30103984/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.414582+02	2025-10-07 10:40:35.414582+02	3.150	0.00	Beauty Bijoux
9337363c-8269-4a34-bd6b-37c561c1bdeb	2024-09-11 12:00:00+02	30103987/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.415489+02	2025-10-07 10:40:35.415489+02	3.570	0.00	Beauty Bijoux
d5627a01-8c93-4435-a928-795c86fc90da	2024-09-11 12:00:00+02	30103988/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.416543+02	2025-10-07 10:40:35.416543+02	1.130	0.00	Beauty Bijoux
ed9c967d-d70d-49e0-a777-4eee8649b7f7	2024-09-11 12:00:00+02	30103989/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.417627+02	2025-10-07 10:40:35.417627+02	1.030	0.00	Beauty Bijoux
cc472af1-0e6b-41b1-9bb5-a1bc8c312b2e	2024-09-11 12:00:00+02	30103990/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.418544+02	2025-10-07 10:40:35.418544+02	0.120	0.00	Beauty Bijoux
22062d4f-17de-412e-ad18-061204d238ec	2024-09-11 12:00:00+02	30103991/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.419622+02	2025-10-07 10:40:35.419622+02	0.370	0.00	Beauty Bijoux
a4eea0be-5c5f-4a64-954a-5160dc14ff18	2024-09-12 12:00:00+02	Inv. 04324HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.42093+02	2025-10-07 10:40:35.42093+02	193.050	0.10	Beauty Bijoux
3900e4f2-0bde-4abd-a7fe-3049c2151acd	2024-09-12 12:00:00+02	Inv. 04424HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.422314+02	2025-10-07 10:40:35.422314+02	36.300	0.10	Beauty Bijoux
8509a554-35b3-4a2b-9343-26ed841b6639	2024-09-12 12:00:00+02	Inv. 04524HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.423405+02	2025-10-07 10:40:35.423405+02	13.200	0.10	Beauty Bijoux
900ef0e7-d9dc-481a-b118-b1a17043e1f9	2024-09-12 12:00:00+02	Inv. 06424PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.424409+02	2025-10-07 10:40:35.424409+02	1.970	0.10	Beauty Bijoux
da5fa50c-f11b-4f9a-b5e2-c792e719a59d	2024-09-12 12:00:00+02	Inv. 06524PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.425643+02	2025-10-07 10:40:35.425643+02	15.770	0.10	Beauty Bijoux
d09db7df-9f5b-417d-a9ad-83b7b83d3bfb	2024-09-12 12:00:00+02	Inv. 06624PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.426684+02	2025-10-07 10:40:35.426684+02	28.320	0.10	Beauty Bijoux
e07a1c74-cfc4-4172-9f5d-061d6d2a2a9f	2024-09-12 12:00:00+02	Inv. 06724PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.427679+02	2025-10-07 10:40:35.427679+02	2.370	0.10	Beauty Bijoux
091b862c-dc77-4518-94bc-581f7ce382da	2024-09-12 12:00:00+02	Inv. 06824PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.428874+02	2025-10-07 10:40:35.428874+02	2.310	0.10	Beauty Bijoux
e5d204ee-0f4f-45cf-865c-4f94c3d893cc	2024-09-13 12:00:00+02	Inv. 1012310	Export to Germany (TH-GUSS PD GOLD)	8.110		Beauty Bijoux	2025-10-07 10:40:35.430638+02	2025-10-07 10:40:35.430638+02	0.000	\N	Beauty Bijoux
430579c2-3aab-4ebf-b961-f68e19ab3c58	2024-09-16 12:00:00+02	Proforma 20240910JWD	Received sample earrings 18K from Paspaley	9.530		Beauty Bijoux	2025-10-07 10:40:35.431555+02	2025-10-07 10:40:35.431555+02	0.000	\N	Beauty Bijoux
2d54ff3c-8a68-4545-881e-0d01794705bf	2024-09-16 12:00:00+02	Proforma 20240910JWD	Received sample necklace 18K from Paspaley	9.700		Beauty Bijoux	2025-10-07 10:40:35.432312+02	2025-10-07 10:40:35.432312+02	0.000	\N	Beauty Bijoux
c3aeb895-4e0e-4e82-bb7a-0482b1f99ecc	2024-09-16 12:00:00+02	IV2409-032	Purchased K18 Lavalier Crown with Silicone "Paspaley" from Nakagawa	18.870		Beauty Bijoux	2025-10-07 10:40:35.433121+02	2025-10-07 10:40:35.433121+02	0.000	\N	Beauty Bijoux
8c3c3e2c-4929-44f4-b54b-02f0f690253a	2024-09-17 12:00:00+02	Inv. 107924	Received accessories from Germany	53.280		Beauty Bijoux	2025-10-07 10:40:35.433885+02	2025-10-07 10:40:35.433885+02	0.000	\N	Beauty Bijoux
67ad109a-d335-4711-a36b-5708e2e34639	2024-09-17 12:00:00+02	HRN2400107_HFI2401301	Received return the wrong order from Poh Heng (Inv. 03724PH) (Credit note 01024CN)	5.940		Beauty Bijoux	2025-10-07 10:40:35.434638+02	2025-10-07 10:40:35.434638+02	0.000	\N	Beauty Bijoux
72a259d1-2492-4b9b-83a5-e8231a7d41c3	2024-09-18 12:00:00+02	Inv. 03924PH	Export to Poh Heng by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.435561+02	2025-10-07 10:40:35.435561+02	16.830	0.10	Beauty Bijoux
c4ca5312-2fbb-4988-9ab0-534e5330c2ee	2024-09-18 12:00:00+02	Inv. 04024PH	Export to Poh Heng by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.436706+02	2025-10-07 10:40:35.436706+02	32.310	0.10	Beauty Bijoux
0522248c-6134-4173-b91c-ef9f4794da3e	2024-09-18 12:00:00+02	Inv. 04624HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.438054+02	2025-10-07 10:40:35.438054+02	82.430	0.10	Beauty Bijoux
5634b013-da03-4238-9de4-82c2429be798	2024-09-18 12:00:00+02	Inv. 04724HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.439275+02	2025-10-07 10:40:35.439275+02	135.510	0.10	Beauty Bijoux
2440f95b-df51-4b4d-8c34-37c2339e04a7	2024-09-20 12:00:00+02	Inv. 06924PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.441488+02	2025-10-07 10:40:35.441488+02	639.830	0.10	Beauty Bijoux
35fac553-1d9c-4213-9076-b143af5cb2dc	2024-09-20 12:00:00+02	Inv. 07024PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.442546+02	2025-10-07 10:40:35.442546+02	105.600	0.10	Beauty Bijoux
987523e4-77a4-47fa-89aa-b686c7c0ea71	2024-09-20 12:00:00+02	HRN2400107_HFI2401301	Received return rimgs from Poh Heng (Inv. 03424PH) (Credit note 01124CN)	2835.250		Beauty Bijoux	2025-10-07 10:40:35.443528+02	2025-10-07 10:40:35.443528+02	0.000	\N	Beauty Bijoux
8b5a214a-d701-4504-a1b0-3da364596777	2024-09-21 12:00:00+02	Inv. 0362401	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.444485+02	2025-10-07 10:40:35.444485+02	3.260	\N	Beauty Bijoux
45b4b56b-0cea-4ef2-8be3-d742e79b1793	2024-09-21 12:00:00+02	Inv. 0362401	Charged accessories 585/- BB Stock	1.570		Beauty Bijoux	2025-10-07 10:40:35.445865+02	2025-10-07 10:40:35.445865+02	0.000	\N	Beauty Bijoux
6792f62c-044c-46a7-afbf-b900fdfe7b52	2024-09-23 12:00:00+02	Inv. 07124PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.446947+02	2025-10-07 10:40:35.446947+02	542.780	0.10	Beauty Bijoux
281a5466-a1f5-4fe2-bb6d-4c441fb4afb7	2024-09-23 12:00:00+02	Inv. 07224PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.447917+02	2025-10-07 10:40:35.447917+02	5.780	0.10	Beauty Bijoux
1d5981bd-8cf2-4a42-91bf-a222f27dc017	2024-09-24 12:00:00+02	Inv. 07324PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.44873+02	2025-10-07 10:40:35.44873+02	166.650	0.10	Beauty Bijoux
81fd539d-e145-454a-a838-9ba6e2de50ae	2024-09-24 12:00:00+02	Inv. 07424PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.449501+02	2025-10-07 10:40:35.449501+02	18.200	0.10	Beauty Bijoux
06b8d303-d8d6-424a-9f25-f28827ee6d0d	2024-09-24 12:00:00+02	Inv. 07524PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.450296+02	2025-10-07 10:40:35.450296+02	33.830	0.10	Beauty Bijoux
398eed66-488a-4126-a95c-9917a53f7c6f	2024-09-24 12:00:00+02	Inv. 108024	Received fine gold from Germany	5000.000		Beauty Bijoux	2025-10-07 10:40:35.451089+02	2025-10-07 10:40:35.451089+02	0.000	\N	Beauty Bijoux
92f6bcae-05cf-4ace-ab4b-01ef80b86c10	2024-09-24 12:00:00+02	Inv. 108224	Received accessories from Germany	3.530		Beauty Bijoux	2025-10-07 10:40:35.451906+02	2025-10-07 10:40:35.451906+02	0.000	\N	Beauty Bijoux
39851411-9843-453c-b6f6-40adb7a40a19	2024-09-25 12:00:00+02	Inv. 04824HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.452897+02	2025-10-07 10:40:35.452897+02	99.000	0.10	Beauty Bijoux
84ebb28e-946c-41f9-9ad6-6b7118046ba2	2024-09-25 12:00:00+02	Inv. 04924HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.453993+02	2025-10-07 10:40:35.453993+02	160.880	0.10	Beauty Bijoux
0b682489-95da-4f07-8694-fd1f284c3a67	2024-09-25 12:00:00+02	Inv. 67-3756	Purchased Soft Soldering Tape for Yellow Gold (14 kt) from NOBLE MIND	306.130		Beauty Bijoux	2025-10-07 10:40:35.455293+02	2025-10-07 10:40:35.455293+02	0.000	\N	Beauty Bijoux
deb96c27-3a3c-4de0-96ed-1501b3912e37	2024-09-26 12:00:00+02	Inv. 07624PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.456308+02	2025-10-07 10:40:35.456308+02	855.030	0.10	Beauty Bijoux
0599475a-30d3-4749-9cd5-a3775ca53e25	2024-09-26 12:00:00+02	30104966/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.457428+02	2025-10-07 10:40:35.457428+02	10.320	0.00	Beauty Bijoux
7d084080-3647-42c6-b7f6-22445deffc2e	2024-09-26 12:00:00+02	30104968/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.458521+02	2025-10-07 10:40:35.458521+02	13.570	0.00	Beauty Bijoux
c66dea95-26a6-43bb-ab65-1cba41419354	2024-09-26 12:00:00+02	30104969/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.459611+02	2025-10-07 10:40:35.459611+02	9.430	0.00	Beauty Bijoux
daa501fa-8e6b-4689-a23c-b267b4d642c5	2024-09-26 12:00:00+02	30104970/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.46058+02	2025-10-07 10:40:35.46058+02	2.760	0.00	Beauty Bijoux
54256477-94d8-48b6-921d-164c719773c9	2024-09-28 12:00:00+02	Inv. 0372401	Charged accessories 585/- BB Stock	1.950		Beauty Bijoux	2025-10-07 10:40:35.461719+02	2025-10-07 10:40:35.461719+02	0.000	\N	Beauty Bijoux
66846a9d-54de-4f0c-9579-a327e02583da	2024-10-01 12:00:00+02	Inv. 04124PH	Export to Poh Heng by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.462879+02	2025-10-07 10:40:35.462879+02	3057.400	0.10	Beauty Bijoux
48083fff-bc32-4322-b46d-a1cbe8f8e59b	2024-10-01 12:00:00+02	Inv. 108424	Received accessories from Germany	51.610		Beauty Bijoux	2025-10-07 10:40:35.464064+02	2025-10-07 10:40:35.464064+02	0.000	\N	Beauty Bijoux
b64e4b3e-e254-41e8-9006-bfae327d976f	2024-10-02 12:00:00+02	Inv. 07724PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.465236+02	2025-10-07 10:40:35.465236+02	60.550	0.10	Beauty Bijoux
fe998d38-5320-4cc7-9788-39f7787ee9f5	2024-10-03 12:00:00+02	Inv. 07824PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.466173+02	2025-10-07 10:40:35.466173+02	129.450	0.10	Beauty Bijoux
b4aa727e-2d42-441b-bb3b-9e919b3e2684	2024-10-04 12:00:00+02	Inv. 0382401	Charged accessories 585/- BB Stock	1.380		Beauty Bijoux	2025-10-07 10:40:35.468965+02	2025-10-07 10:40:35.468965+02	0.000	\N	Beauty Bijoux
1db37a76-ed2b-441d-ae97-27b3b07958c1	2024-10-05 12:00:00+02	Inv. 0382402	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.470273+02	2025-10-07 10:40:35.470273+02	1.800	\N	Beauty Bijoux
99a7bc45-a6b0-4c59-8adf-5f3897a17ea3	2024-10-05 12:00:00+02	Inv. 108624	Received accessories from Germany	62.330		Beauty Bijoux	2025-10-07 10:40:35.47366+02	2025-10-07 10:40:35.47366+02	0.000	\N	Beauty Bijoux
9ec43be5-ea29-4dad-b870-51c6fabe1c45	2024-10-08 12:00:00+02	Inv. 07924PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.474614+02	2025-10-07 10:40:35.474614+02	62.040	0.10	Beauty Bijoux
c82ec64b-51f8-4ce2-aa65-dea1d4c6168c	2024-10-08 12:00:00+02	Inv. 08024PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.475468+02	2025-10-07 10:40:35.475468+02	288.960	0.10	Beauty Bijoux
4d1c2a0c-d0dd-4430-9cbc-b7825b687824	2024-10-09 12:00:00+02	Inv. 08124PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.47636+02	2025-10-07 10:40:35.47636+02	21.090	0.10	Beauty Bijoux
340b10c6-5b4e-47b7-8140-d38bfcfa64fa	2024-10-09 12:00:00+02	Inv. 08224PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.477185+02	2025-10-07 10:40:35.477185+02	3.060	0.10	Beauty Bijoux
1b46bb63-6b8e-400a-88c9-507bc14ccf0b	2024-10-09 12:00:00+02	Inv. 08324PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.47813+02	2025-10-07 10:40:35.47813+02	2.350	0.10	Beauty Bijoux
4f2448fe-560c-4a2f-aa00-e39661f3d8b8	2024-10-09 12:00:00+02	Inv. 08424PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.479358+02	2025-10-07 10:40:35.479358+02	3.060	0.10	Beauty Bijoux
50a692c0-a376-44f2-aa2c-188813005b10	2024-10-11 12:00:00+02	Inv. 01824SP	Export to Aspial by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.480465+02	2025-10-07 10:40:35.480465+02	2.400	0.10	Beauty Bijoux
6c44ecfa-6170-495f-90af-9f3809eaa1f1	2024-10-11 12:00:00+02	Inv. 01924SP	Export to Aspial by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.481367+02	2025-10-07 10:40:35.481367+02	4.620	0.10	Beauty Bijoux
97d45c34-d74e-4dbb-afd4-3a5679382d06	2024-10-11 12:00:00+02	Inv. 02024SP	Export to Aspial by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.482408+02	2025-10-07 10:40:35.482408+02	3.320	0.10	Beauty Bijoux
bf6d69ed-3be0-4dac-9654-b274ca0b5e7d	2024-10-11 12:00:00+02	Inv. 02124SP	Export to Aspial by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.483639+02	2025-10-07 10:40:35.483639+02	1.050	0.10	Beauty Bijoux
3c15cb55-cc90-4d44-985f-85f961907252	2024-10-11 12:00:00+02	Inv. 02224SP	Export to Aspial by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.485782+02	2025-10-07 10:40:35.485782+02	1.290	0.10	Beauty Bijoux
b7dd3f27-995e-4782-bd48-9146a6453017	2024-10-11 12:00:00+02	30105817/02/01-02	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.488168+02	2025-10-07 10:40:35.488168+02	18.150	0.00	Beauty Bijoux
884d5a23-2197-4d64-958d-a19c76d153f3	2024-10-11 12:00:00+02	30105818/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.489581+02	2025-10-07 10:40:35.489581+02	5.740	0.00	Beauty Bijoux
7a447670-c966-4bb0-962d-f40ffcd6efd0	2024-10-11 12:00:00+02	30105819/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.490632+02	2025-10-07 10:40:35.490632+02	2.050	0.00	Beauty Bijoux
8e78287d-6a7e-4ce3-8d30-a2a8304e6a13	2024-10-12 12:00:00+02	Inv. 0392401	Charged accessories 585/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.491586+02	2025-10-07 10:40:35.491586+02	0.590	\N	Beauty Bijoux
a8e24f52-ca75-4d33-bd99-a42822061d8b	2024-10-12 12:00:00+02	Inv. 0392401	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.492401+02	2025-10-07 10:40:35.492401+02	8.530	\N	Beauty Bijoux
bd701bce-35cc-4ef2-9f6c-fd1c13679cf0	2024-10-14 12:00:00+02	Inv. 04224PH	Export to Poh Heng by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.493185+02	2025-10-07 10:40:35.493185+02	7.100	0.10	Beauty Bijoux
335dc5f6-de9e-4496-90b7-cf735f6e0c66	2024-10-16 12:00:00+02	Inv. 01224ART	Export to Artistry by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.493929+02	2025-10-07 10:40:35.493929+02	113.060	0.10	Beauty Bijoux
c201af82-b2b5-4e6e-a67f-79244c3a45af	2024-10-16 12:00:00+02	Inv. 01324ART	Export Sample to Artistry by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.494865+02	2025-10-07 10:40:35.494865+02	1.900	0.10	Beauty Bijoux
797d3a4e-2c5d-448f-bf28-5c8528f1e150	2024-10-17 12:00:00+02	IV2410-052	Purchased K18YG 230SDC4 from Nakagawa	29.280		Beauty Bijoux	2025-10-07 10:40:35.495905+02	2025-10-07 10:40:35.495905+02	0.000	\N	Beauty Bijoux
48d9924a-87e7-46bd-9b41-897a77427316	2024-10-17 12:00:00+02	IV2410-052	Purchased K18WGPd10 230SDC4 from Nakagawa	32.680		Beauty Bijoux	2025-10-07 10:40:35.496722+02	2025-10-07 10:40:35.496722+02	0.000	\N	Beauty Bijoux
d922c381-e91d-464b-954d-b522811cfbfa	2024-10-17 12:00:00+02	IV2410-052	Purchased K18PG 230SDC4 from Nakagawa	29.370		Beauty Bijoux	2025-10-07 10:40:35.497456+02	2025-10-07 10:40:35.497456+02	0.000	\N	Beauty Bijoux
98a45eb8-f797-471f-99d0-e4fccb924f2a	2024-10-17 12:00:00+02	IV2410-052	Purchased K18 Lobster 10mm "P+750" from Nakagawa	3.780		Beauty Bijoux	2025-10-07 10:40:35.49833+02	2025-10-07 10:40:35.49833+02	0.000	\N	Beauty Bijoux
685ccf11-6fc5-4af7-90a6-6b770667260b	2024-10-17 12:00:00+02	IV2410-052	Purchased K18WGPD5 Lobster 10mm "P+750" NFRP from Nakagawa	3.810		Beauty Bijoux	2025-10-07 10:40:35.499363+02	2025-10-07 10:40:35.499363+02	0.000	\N	Beauty Bijoux
3e2bc45a-b80b-45af-a611-0ddab3a446af	2024-10-17 12:00:00+02	IV2410-052	Purchased K18PG Lobster 10mm "P+750" from Nakagawa	3.890		Beauty Bijoux	2025-10-07 10:40:35.500503+02	2025-10-07 10:40:35.500503+02	0.000	\N	Beauty Bijoux
908d66f1-bd89-4276-b7cc-8619ec24f82c	2024-10-17 12:00:00+02	IV2410-052	Purchased K18YG LS4mm Slide Bead with PNK-15(V) from Nakagawa	1.770		Beauty Bijoux	2025-10-07 10:40:35.501546+02	2025-10-07 10:40:35.501546+02	0.000	\N	Beauty Bijoux
f2c465a2-d99e-4946-afec-577be1c854ff	2024-10-17 12:00:00+02	IV2410-052	Purchased K18WGPd5 LS4mm Slide Bead with PNK-15(V) NFRP from Nakagawa	1.190		Beauty Bijoux	2025-10-07 10:40:35.502627+02	2025-10-07 10:40:35.502627+02	0.000	\N	Beauty Bijoux
259b6f1c-e5e2-4cf1-bb85-15cd29faef5b	2024-10-17 12:00:00+02	IV2410-052	Purchased K18PG LS4mm Slide Bead with PNK-15(V) from Nakagawa	1.890		Beauty Bijoux	2025-10-07 10:40:35.503755+02	2025-10-07 10:40:35.503755+02	0.000	\N	Beauty Bijoux
8f7e4647-ca16-4338-a8c6-7c37162b6680	2024-10-17 12:00:00+02	IV2410-053	Purchased K18YG 230SDC4 from Nakagawa	121.830		Beauty Bijoux	2025-10-07 10:40:35.504952+02	2025-10-07 10:40:35.504952+02	0.000	\N	Beauty Bijoux
b4ac16fd-928e-47cf-a92d-3cb647f9e9d6	2024-10-17 12:00:00+02	IV2410-053	Purchased K18WGPd10 230SDC4 from Nakagawa	81.690		Beauty Bijoux	2025-10-07 10:40:35.506064+02	2025-10-07 10:40:35.506064+02	0.000	\N	Beauty Bijoux
0bb2f2b6-c509-44b2-b82b-2cb8fdbbd6a1	2024-10-17 12:00:00+02	IV2410-053	Purchased K18PG 230SDC4 from Nakagawa	12.240		Beauty Bijoux	2025-10-07 10:40:35.507074+02	2025-10-07 10:40:35.507074+02	0.000	\N	Beauty Bijoux
21fe27cc-2120-49c6-8baf-778198168ee3	2024-10-17 12:00:00+02	IV2410-053	Purchased K18 Lobster 10mm "P+750" from Nakagawa	17.620		Beauty Bijoux	2025-10-07 10:40:35.507951+02	2025-10-07 10:40:35.507951+02	0.000	\N	Beauty Bijoux
baadc047-82a1-4d83-bd1b-bb29cbd6df40	2024-10-17 12:00:00+02	IV2410-053	Purchased K18WGPD5 Lobster 10mm "P+750" NFRP from Nakagawa	5.900		Beauty Bijoux	2025-10-07 10:40:35.508828+02	2025-10-07 10:40:35.508828+02	0.000	\N	Beauty Bijoux
abc0accd-94e5-4430-b532-742947af2012	2024-10-17 12:00:00+02	IV2410-053	Purchased K18PG Lobster 10mm "P+750" from Nakagawa	1.570		Beauty Bijoux	2025-10-07 10:40:35.509715+02	2025-10-07 10:40:35.509715+02	0.000	\N	Beauty Bijoux
c4fd3603-f50d-4a12-b2cd-09fe947d35fe	2024-10-17 12:00:00+02	IV2410-053	Purchased K18YG LS4mm Slide Bead with PNK-15(V) from Nakagawa	7.920		Beauty Bijoux	2025-10-07 10:40:35.510726+02	2025-10-07 10:40:35.510726+02	0.000	\N	Beauty Bijoux
9b997067-ce38-4366-88ad-d82227e4ba45	2024-10-17 12:00:00+02	IV2410-053	Purchased K18WGPd5 LS4mm Slide Bead with PNK-15(V) NFRP from Nakagawa	5.150		Beauty Bijoux	2025-10-07 10:40:35.512083+02	2025-10-07 10:40:35.512083+02	0.000	\N	Beauty Bijoux
65df8da3-5528-4ae0-936e-00d0f6b6c312	2024-10-17 12:00:00+02	IV2410-053	Purchased K18PG LS4mm Slide Bead with PNK-15(V) from Nakagawa	0.570		Beauty Bijoux	2025-10-07 10:40:35.513101+02	2025-10-07 10:40:35.513101+02	0.000	\N	Beauty Bijoux
e53fa23c-5398-4829-9931-69a39326af16	2024-10-18 12:00:00+02	30106327/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.514018+02	2025-10-07 10:40:35.514018+02	3.660	0.00	Beauty Bijoux
7fd32e5d-d5b1-4b92-9660-d5cc67fd3550	2024-10-18 12:00:00+02	30106328/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.514866+02	2025-10-07 10:40:35.514866+02	1.040	0.00	Beauty Bijoux
536c668d-9ff4-4568-ad24-bfac1c386d1a	2024-10-18 12:00:00+02	30106329/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.515811+02	2025-10-07 10:40:35.515811+02	0.900	0.00	Beauty Bijoux
78c5d429-8dfc-436c-92c7-bc9188f27cfa	2024-10-18 12:00:00+02	30106330/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.51671+02	2025-10-07 10:40:35.51671+02	0.180	0.00	Beauty Bijoux
cab3b95b-2d6c-44bb-9852-c869422dfd00	2024-10-18 12:00:00+02	30106332/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.517559+02	2025-10-07 10:40:35.517559+02	0.350	0.00	Beauty Bijoux
09415876-eb60-4da6-82de-d0b9bb3e87fc	2024-10-18 12:00:00+02	Proforma 20241010JWD	Received sample necklace 18K YG from Paspaley	40.330		Beauty Bijoux	2025-10-07 10:40:35.518299+02	2025-10-07 10:40:35.518299+02	0.000	\N	Beauty Bijoux
94d9df27-6752-4f3b-820e-7836d2b4b434	2024-10-18 12:00:00+02	Inv. 08524PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.519221+02	2025-10-07 10:40:35.519221+02	40.300	0.10	Beauty Bijoux
c9ff81fd-5c14-4077-8340-c20b0781047e	2024-10-18 12:00:00+02	Inv. 08624PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.52048+02	2025-10-07 10:40:35.52048+02	122.520	0.10	Beauty Bijoux
6588dfc7-183e-4b10-b55f-524afc9c54b2	2024-10-18 12:00:00+02	Inv. 0402401	Charged accessories 585/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.521525+02	2025-10-07 10:40:35.521525+02	1.170	\N	Beauty Bijoux
4655fb1a-0999-4437-baae-1b6ded362bda	2024-10-19 12:00:00+02	Inv. 0402402	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.522561+02	2025-10-07 10:40:35.522561+02	0.370	\N	Beauty Bijoux
a08d9d12-8a1a-4c86-87c3-79eafc3d5bc3	2024-10-21 12:00:00+02	CN10-02	Received returned rimg 18K from Aspial	2.880		Beauty Bijoux	2025-10-07 10:40:35.52348+02	2025-10-07 10:40:35.52348+02	0.000	\N	Beauty Bijoux
900a5a20-981f-42fe-929f-b0f960a040a2	2024-10-22 12:00:00+02	Inv. 108924	Received accessories from Germany	116.690		Beauty Bijoux	2025-10-07 10:40:35.524319+02	2025-10-07 10:40:35.524319+02	0.000	\N	Beauty Bijoux
4c4db440-7649-4a53-a0ba-3cf0baa6b37d	2024-10-22 12:00:00+02	Commercial Inv. AWB No: 4299554302	Received earrings 18K for repair from QNet (Inv. 06923HK)	5.780		Beauty Bijoux	2025-10-07 10:40:35.525166+02	2025-10-07 10:40:35.525166+02	0.000	\N	Beauty Bijoux
0e07d485-cc63-4ef4-ae04-d7e677dce84d	2024-10-24 12:00:00+02	Proforma Inv. 24/10-2024	Shipped repaired earrings 18K to QNet (Dubai) by DHL	5.780		Beauty Bijoux	2025-10-07 10:40:35.526179+02	2025-10-07 10:40:35.526179+02	0.000	\N	Beauty Bijoux
73f5d0b4-3bd1-4b29-865f-bb403aa58b50	2024-10-24 12:00:00+02	Inv. 05024HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.527162+02	2025-10-07 10:40:35.527162+02	64.350	0.10	Beauty Bijoux
36d79d1e-d5a5-4a18-9213-0c9739f1cd4d	2024-10-24 12:00:00+02	Inv. 05124HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.528231+02	2025-10-07 10:40:35.528231+02	113.450	0.10	Beauty Bijoux
217ac734-7454-4cfe-b0dd-f5845de4ed61	2024-10-24 12:00:00+02	Inv. 05224HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.529415+02	2025-10-07 10:40:35.529415+02	79.080	0.10	Beauty Bijoux
9da0d474-abaf-484f-b47e-1f802d715fa4	2024-10-26 12:00:00+02	Inv. 0412401	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.530433+02	2025-10-07 10:40:35.530433+02	21.030	\N	Beauty Bijoux
e1036a7d-ae2e-4d0b-90ef-ae0e3a2efc48	2024-10-26 12:00:00+02	Inv. 0412402	Charged accessories 585/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.531614+02	2025-10-07 10:40:35.531614+02	0.390	\N	Beauty Bijoux
2a1a4d57-0b58-4d91-83a1-417bf7824802	2024-10-28 11:00:00+01	Inv. 08724PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.532707+02	2025-10-07 10:40:35.532707+02	3.710	0.10	Beauty Bijoux
6bb41fb7-5f14-44ba-89c6-d5cb3690bd08	2024-10-28 11:00:00+01	Inv. 08824PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.533619+02	2025-10-07 10:40:35.533619+02	472.230	0.10	Beauty Bijoux
d6aa4bef-a471-4f81-9abe-77490b71bde8	2024-10-28 11:00:00+01	Inv. 08924PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.534611+02	2025-10-07 10:40:35.534611+02	212.120	0.10	Beauty Bijoux
a29e07dc-3bb8-4926-a194-1686fbb282dc	2024-10-28 11:00:00+01	Inv. 09024PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.536555+02	2025-10-07 10:40:35.536555+02	42.990	0.10	Beauty Bijoux
d78b9271-3966-437f-89ed-cd75e4f3a0b0	2024-10-28 11:00:00+01	Inv. 09124PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.537924+02	2025-10-07 10:40:35.537924+02	63.120	0.10	Beauty Bijoux
b65ac20b-3724-4210-af9b-b5ef5acf3dfa	2024-10-29 11:00:00+01	Inv. 05324HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.53902+02	2025-10-07 10:40:35.53902+02	165.000	0.10	Beauty Bijoux
dc77af90-87de-4ce4-a533-23c901374d26	2024-10-29 11:00:00+01	Inv. 05424HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.539894+02	2025-10-07 10:40:35.539894+02	39.600	0.10	Beauty Bijoux
ec67e004-276c-4570-beb4-8edcd8859919	2024-10-29 11:00:00+01	Inv. 109224	Received accessories from Germany	17.540		Beauty Bijoux	2025-10-07 10:40:35.540671+02	2025-10-07 10:40:35.540671+02	0.000	\N	Beauty Bijoux
8fba1165-b6e3-4b6b-9b36-0c1a1b71bbc5	2024-10-29 11:00:00+01	Inv. 109224	Received gold sheet 375/- from Germany	52.430		Beauty Bijoux	2025-10-07 10:40:35.541482+02	2025-10-07 10:40:35.541482+02	0.000	\N	Beauty Bijoux
44420288-1737-4a27-a594-4be66defce8b	2024-10-29 11:00:00+01	Inv. 109224	Received samples earrings 750/- from Germany (ATTN: Dan & Pablo)	15.570		Beauty Bijoux	2025-10-07 10:40:35.542256+02	2025-10-07 10:40:35.542256+02	0.000	\N	Beauty Bijoux
43658b4e-5599-4f02-8516-8638f596b296	2024-10-29 11:00:00+01	IV2410-079	Purchased K18WGPD1.25 Lavalier Crown with Silicone "Paspaley" NFRP from Nakagawa	5.030		Beauty Bijoux	2025-10-07 10:40:35.543133+02	2025-10-07 10:40:35.543133+02	0.000	\N	Beauty Bijoux
c2a06028-9dc9-4824-a56f-249e3db1f7ae	2024-10-29 11:00:00+01	IV2410-079	Purchased K18PG Lavalier Crown with Silicone "Paspaley" from Nakagawa	5.100		Beauty Bijoux	2025-10-07 10:40:35.544001+02	2025-10-07 10:40:35.544001+02	0.000	\N	Beauty Bijoux
9b4edc14-9a44-4bb4-8357-ae368445f6bb	2024-10-29 11:00:00+01	IV2410-080	Purchased K18WGPD5 Lobster 10mm "P+750" NFRP from Nakagawa	2.090		Beauty Bijoux	2025-10-07 10:40:35.544971+02	2025-10-07 10:40:35.544971+02	0.000	\N	Beauty Bijoux
e082fe0c-d64e-4451-95e1-27794a8c21a6	2024-10-29 11:00:00+01	IV2410-080	Purchased K18WGPD1.25 Lavalier Crown with Silicone "Paspaley" NFRP from Nakagawa	21.120		Beauty Bijoux	2025-10-07 10:40:35.546067+02	2025-10-07 10:40:35.546067+02	0.000	\N	Beauty Bijoux
cad65cf0-1711-45ed-ab1d-e7e06690f627	2024-10-29 11:00:00+01	IV2410-080	Purchased K18PG Lavalier Crown with Silicone "Paspaley" from Nakagawa	2.040		Beauty Bijoux	2025-10-07 10:40:35.547001+02	2025-10-07 10:40:35.547001+02	0.000	\N	Beauty Bijoux
fde85f75-15fc-4ddd-9f5b-de1c72d108c7	2024-10-29 11:00:00+01	30107099/02/01-02	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.548056+02	2025-10-07 10:40:35.548056+02	22.460	0.00	Beauty Bijoux
7670cc7a-7257-4c32-9b1b-5943266ecec2	2024-10-29 11:00:00+01	30107100/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.549058+02	2025-10-07 10:40:35.549058+02	9.510	0.00	Beauty Bijoux
260fa940-ebb9-41f8-a0ed-f20e09296dd0	2024-10-29 11:00:00+01	30107101/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.550041+02	2025-10-07 10:40:35.550041+02	3.260	0.00	Beauty Bijoux
770229d9-1c50-4652-b7ca-d11878818dca	2024-10-30 11:00:00+01	Proforma 20241024JWD	Received Sample Earrings 18K from Paspaley	10.890		Beauty Bijoux	2025-10-07 10:40:35.550903+02	2025-10-07 10:40:35.550903+02	0.000	\N	Beauty Bijoux
4c072d9d-9a31-42f6-b59e-69d8b6ad4ca9	2024-10-30 11:00:00+01	Proforma 20241024JWD	Received earrings 18K for repair from Paspaley (Inv. 07524PPY)	3.390		Beauty Bijoux	2025-10-07 10:40:35.551822+02	2025-10-07 10:40:35.551822+02	0.000	\N	Beauty Bijoux
847716bf-ca88-47f6-a5c4-62df7948c62a	2024-10-30 11:00:00+01	Proforma 20241024JWD	Received earrings 18K for repair from Paspaley (Inv. 06524PPY)	15.770		Beauty Bijoux	2025-10-07 10:40:35.552956+02	2025-10-07 10:40:35.552956+02	0.000	\N	Beauty Bijoux
570bdfd6-e50a-4743-8d2c-ab69a8ff4bda	2024-10-30 11:00:00+01	Proforma 20241024JWD	Received a ring 18K to be restored for a new ring from Paspaley	8.500		Beauty Bijoux	2025-10-07 10:40:35.554111+02	2025-10-07 10:40:35.554111+02	0.000	\N	Beauty Bijoux
b4e2ff2f-76b2-4670-af21-744a7095e826	2024-10-31 11:00:00+01	Inv. 01424ART	Export to Artistry by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.556272+02	2025-10-07 10:40:35.556272+02	33.680	0.10	Beauty Bijoux
d5378218-6b6e-492f-bdea-47e76afab9e5	2024-10-31 11:00:00+01	Inv. 0422401	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.557436+02	2025-10-07 10:40:35.557436+02	0.530	\N	Beauty Bijoux
10da61b5-372b-4376-b1d3-66f8ccc411ff	2024-10-31 11:00:00+01	Inv. 0422401	Charged accessories 333/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.558364+02	2025-10-07 10:40:35.558364+02	0.700	\N	Beauty Bijoux
a8b0cbd6-a766-4b55-9226-91fbb80175d6	2024-11-01 11:00:00+01	Inv. 1012352	Export to Germany (TH-GUSS PD GOLD)	0.000		Beauty Bijoux	2025-10-07 10:40:35.559203+02	2025-10-07 10:40:35.559203+02	5.020	0.10	Beauty Bijoux
95f96327-0354-4b5e-b711-13f6f0ac9205	2024-11-02 11:00:00+01	Inv. 0422402	Charged accessories 585/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.560013+02	2025-10-07 10:40:35.560013+02	1.110	\N	Beauty Bijoux
5f780b88-68e7-4535-8937-3d55500cb861	2024-11-04 11:00:00+01	Inv. 05524HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.560747+02	2025-10-07 10:40:35.560747+02	150.980	0.10	Beauty Bijoux
97b54066-1b4a-4d76-833c-b4a3e7251a47	2024-11-04 11:00:00+01	Inv. 05624HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.561721+02	2025-10-07 10:40:35.561721+02	30.200	0.10	Beauty Bijoux
d8749a6c-332e-45ae-b329-855cd5c34653	2024-11-05 11:00:00+01	Inv. 05724HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.562792+02	2025-10-07 10:40:35.562792+02	101.480	0.10	Beauty Bijoux
9d972663-131c-4817-bfe4-a5fa7252ffa1	2024-11-05 11:00:00+01	IV2411-016	Purchased K18 Lavalier Crown with Silicone "Paspaley" from Nakagawa	7.360		Beauty Bijoux	2025-10-07 10:40:35.563709+02	2025-10-07 10:40:35.563709+02	0.000	\N	Beauty Bijoux
7c6e63c3-a467-4bf9-bdd0-dec55bbb4b34	2024-11-05 11:00:00+01	IV2411-017	Purchased K18 Lavalier Crown with Silicone "Paspaley" from Nakagawa	22.270		Beauty Bijoux	2025-10-07 10:40:35.564514+02	2025-10-07 10:40:35.564514+02	0.000	\N	Beauty Bijoux
51f4224c-927f-4eb4-a8b7-6e00d83e43e4	2024-11-05 11:00:00+01	Inv. 109424	Received accessories from Germany	0.630		Beauty Bijoux	2025-10-07 10:40:35.565349+02	2025-10-07 10:40:35.565349+02	0.000	\N	Beauty Bijoux
26843622-333e-49bc-b557-b6b3b6c68e41	2024-11-05 11:00:00+01	Inv. 109424	Received fine gold from Germany	2000.000		Beauty Bijoux	2025-10-07 10:40:35.566192+02	2025-10-07 10:40:35.566192+02	0.000	\N	Beauty Bijoux
beb6d52c-bfb8-4fb6-9d01-480860408a7d	2024-11-06 11:00:00+01	Inv. 09224PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.567069+02	2025-10-07 10:40:35.567069+02	118.730	0.10	Beauty Bijoux
e1f0266f-0458-46ab-bc68-3d07495212a4	2024-11-06 11:00:00+01	Inv. 09324PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.568104+02	2025-10-07 10:40:35.568104+02	456.890	0.10	Beauty Bijoux
cb9efd14-a75c-49e6-b035-e91d60479348	2024-11-06 11:00:00+01	Inv. 09424PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.569169+02	2025-10-07 10:40:35.569169+02	7.680	0.10	Beauty Bijoux
e007f91f-9e41-458e-a527-f39c0bb51ba9	2024-11-06 11:00:00+01	Inv. 09524PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.570251+02	2025-10-07 10:40:35.570251+02	56.100	0.10	Beauty Bijoux
b905f5ac-c674-4bfe-87df-4bb37bd71fc3	2024-11-07 11:00:00+01	Inv. 09624PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.571659+02	2025-10-07 10:40:35.571659+02	220.700	0.10	Beauty Bijoux
85565b71-efe2-4ae3-8189-9f5c366cd6cf	2024-11-07 11:00:00+01	Inv. 09724PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.572931+02	2025-10-07 10:40:35.572931+02	177.710	0.10	Beauty Bijoux
36a35df9-817d-4679-ae51-f2f62bd68cbb	2024-11-08 11:00:00+01	Inv. 09824PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.573961+02	2025-10-07 10:40:35.573961+02	64.110	0.10	Beauty Bijoux
f6ca2dd6-2060-4b13-a2bb-d91eea4b8eae	2024-11-08 11:00:00+01	Inv. 09924PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.575063+02	2025-10-07 10:40:35.575063+02	363.000	0.10	Beauty Bijoux
0098a6a7-2011-4a36-90ee-67b0c2538144	2024-11-08 11:00:00+01	Inv. 10024PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.576234+02	2025-10-07 10:40:35.576234+02	38.610	0.10	Beauty Bijoux
87445f84-769d-4f85-9b0e-ed71b9aaa786	2024-11-08 11:00:00+01	Inv. 10124PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.577488+02	2025-10-07 10:40:35.577488+02	150.980	0.10	Beauty Bijoux
ca2fee07-f56f-4712-a87c-745f5b6708e5	2024-11-08 11:00:00+01	Inv. 10224PPY	Export to Paspaley by DHL (Charge for additional weight of the repair 002PCO0012049) (Proforma 20241024JWD)	1.060		Beauty Bijoux	2025-10-07 10:40:35.578653+02	2025-10-07 10:40:35.578653+02	0.000	\N	Beauty Bijoux
e29fdb5f-ab0a-4e57-a7f9-63989150c762	2024-11-08 11:00:00+01	Inv. 0432401	Charged accessories 585/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.580066+02	2025-10-07 10:40:35.580066+02	1.810	\N	Beauty Bijoux
31de3985-6db2-4cf4-a2c7-e61aee0db86f	2024-11-08 11:00:00+01	Inv. 0432401	Charged accessories 333/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.581138+02	2025-10-07 10:40:35.581138+02	0.050	\N	Beauty Bijoux
8b4301ec-c10a-493d-8ad0-d44e4c15be06	2024-11-08 11:00:00+01	Inv. 0432401	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.582033+02	2025-10-07 10:40:35.582033+02	8.060	\N	Beauty Bijoux
d3720517-bdfc-4227-be9a-e8dcf13f7b11	2024-11-09 11:00:00+01	Inv. 0432402	Charged accessories 333/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.582852+02	2025-10-07 10:40:35.582852+02	0.050	\N	Beauty Bijoux
6b28b40e-a466-4aca-b6ea-b68abefa2c46	2024-11-11 11:00:00+01	Inv. 05824HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.583626+02	2025-10-07 10:40:35.583626+02	217.800	0.10	Beauty Bijoux
ebecdc91-24b7-4a1d-b395-b4c8ac71ba24	2024-11-11 11:00:00+01	Inv. 05924HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.585316+02	2025-10-07 10:40:35.585316+02	127.050	0.10	Beauty Bijoux
c8763ab8-1fea-401d-9c83-cfdb1421604c	2024-11-12 11:00:00+01	Inv. 109624	Received accessories from Germany	29.330		Beauty Bijoux	2025-10-07 10:40:35.5862+02	2025-10-07 10:40:35.5862+02	0.000	\N	Beauty Bijoux
0ba1759d-b1cb-483b-9669-e7afcc18031a	2024-11-12 11:00:00+01	30107963/02/01-02	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.587118+02	2025-10-07 10:40:35.587118+02	23.550	0.00	Beauty Bijoux
5a29c0ec-bd83-4fd7-8061-c700a3791aa5	2024-11-12 11:00:00+01	30107964/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.588191+02	2025-10-07 10:40:35.588191+02	6.600	0.00	Beauty Bijoux
62ba7706-20c0-4e6e-83db-22d21eb76fe3	2024-11-12 11:00:00+01	30107965/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.589243+02	2025-10-07 10:40:35.589243+02	2.790	0.00	Beauty Bijoux
28a02563-3d82-474b-84b3-3509ea64c09f	2024-11-12 11:00:00+01	30107969/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.590252+02	2025-10-07 10:40:35.590252+02	2.640	0.00	Beauty Bijoux
64065f52-8e5b-4929-a4b8-0a206f9cce81	2024-11-12 11:00:00+01	30107970/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.591296+02	2025-10-07 10:40:35.591296+02	0.830	0.00	Beauty Bijoux
2b250c36-1765-4d1f-9a30-e4acc986ba9a	2024-11-12 11:00:00+01	30107972/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.592341+02	2025-10-07 10:40:35.592341+02	0.920	0.00	Beauty Bijoux
452d86ad-7ee3-4f2c-b74b-119225be29c5	2024-11-12 11:00:00+01	30107974/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.5934+02	2025-10-07 10:40:35.5934+02	0.130	0.00	Beauty Bijoux
0a6b5219-3fc8-4f3d-9522-907d4394faaa	2024-11-12 11:00:00+01	30107975/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.594529+02	2025-10-07 10:40:35.594529+02	0.330	0.00	Beauty Bijoux
e2b45298-59ab-4de7-8d42-c256480e6c65	2024-11-13 11:00:00+01	Inv. 02424SP	Export to Aspial by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.595838+02	2025-10-07 10:40:35.595838+02	7.140	0.10	Beauty Bijoux
35b9c24a-fc86-49de-ab3e-d4521eb84d96	2024-11-13 11:00:00+01	Inv. 02524SP	Export to Aspial by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.596847+02	2025-10-07 10:40:35.596847+02	8.240	0.10	Beauty Bijoux
4e203b5c-7509-4caa-a829-4f8630d78991	2024-11-13 11:00:00+01	Inv. 02624SP	Export to Aspial by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.597979+02	2025-10-07 10:40:35.597979+02	24.860	0.10	Beauty Bijoux
76c464f5-9d77-4e45-8aef-8e44fddc3cc3	2024-11-14 11:00:00+01	30107966/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.599122+02	2025-10-07 10:40:35.599122+02	1.460	0.00	Beauty Bijoux
67e496da-3d18-41d8-81c8-3d3b2a14b045	2024-11-16 11:00:00+01	Inv. 0442401	Charged accessories 585/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.600121+02	2025-10-07 10:40:35.600121+02	0.430	\N	Beauty Bijoux
238bb400-4373-44d8-96d0-28fe578f1e64	2024-11-16 11:00:00+01	Inv. 0442401	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.601183+02	2025-10-07 10:40:35.601183+02	1.490	\N	Beauty Bijoux
5f332e4d-3b48-4657-bf96-2708923d39a0	2024-11-18 11:00:00+01	Inv. 00124NAK	Export to Nakagawa by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.602437+02	2025-10-07 10:40:35.602437+02	157.170	0.10	Beauty Bijoux
50578544-1469-4d79-90b2-8afcea559212	2024-11-19 11:00:00+01	Inv. 109824	Received accessories from Germany	1.990		Beauty Bijoux	2025-10-07 10:40:35.603829+02	2025-10-07 10:40:35.603829+02	0.000	\N	Beauty Bijoux
e3ff2173-73ac-42dd-a4a6-aa13bd46b6f7	2024-11-20 11:00:00+01	Inv. 10324PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.605088+02	2025-10-07 10:40:35.605088+02	423.230	0.10	Beauty Bijoux
ff863312-f050-4626-8684-39e3ea55cbdb	2024-11-20 11:00:00+01	Inv. 10424PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.606311+02	2025-10-07 10:40:35.606311+02	70.790	0.10	Beauty Bijoux
76860835-6ab0-4749-9a4d-3ba5d241fc9f	2024-11-20 11:00:00+01	Inv. 10524PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.607387+02	2025-10-07 10:40:35.607387+02	140.580	0.10	Beauty Bijoux
46b4911d-a9f5-49ec-9796-e06d42cd36a2	2024-11-20 11:00:00+01	Inv. 10624PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.608515+02	2025-10-07 10:40:35.608515+02	90.260	0.10	Beauty Bijoux
69531e51-d0a3-4726-b598-6d231af8ffbd	2024-11-20 11:00:00+01	Inv. 10724PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.609633+02	2025-10-07 10:40:35.609633+02	42.740	0.10	Beauty Bijoux
9740c6de-5312-43d5-b81f-7ccbbbea4d08	2024-11-21 11:00:00+01	Inv. 00524AU	Export to Sarah & Sebastian by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.610674+02	2025-10-07 10:40:35.610674+02	137.110	0.10	Beauty Bijoux
b30f9428-77f9-4dae-89f4-85c9e435f700	2024-11-22 11:00:00+01	Inv. 0452401	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.611696+02	2025-10-07 10:40:35.611696+02	3.100	\N	Beauty Bijoux
bebd578c-9e09-4467-80b3-e7aa71c0b7b7	2024-11-22 11:00:00+01	Inv. 0452401	Charged gold sheet 750/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.612803+02	2025-10-07 10:40:35.612803+02	1.380	\N	Beauty Bijoux
a45aa4a4-4786-4401-b183-3498bb3315f3	2024-11-23 11:00:00+01	Inv. 0452402	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.61394+02	2025-10-07 10:40:35.61394+02	18.510	\N	Beauty Bijoux
02114c4f-feda-49c9-9dc0-a349cc8d86db	2024-11-26 11:00:00+01	Inv. 110024	Received fine gold from Germany	3000.000		Beauty Bijoux	2025-10-07 10:40:35.614916+02	2025-10-07 10:40:35.614916+02	0.000	\N	Beauty Bijoux
ce0c7276-b3e7-48f6-bce4-fb08f72b242e	2024-11-26 11:00:00+01	Inv. 110124	Received accessories from Germany	29.100		Beauty Bijoux	2025-10-07 10:40:35.615927+02	2025-10-07 10:40:35.615927+02	0.000	\N	Beauty Bijoux
31e947b8-dd04-496d-baf0-0a582e1fc419	2024-11-26 11:00:00+01	Inv. 110124	Received gold sheet 375/- from Germany	75.330		Beauty Bijoux	2025-10-07 10:40:35.616865+02	2025-10-07 10:40:35.616865+02	0.000	\N	Beauty Bijoux
de3ba40d-6928-43f7-9792-3f68a66add0c	2024-11-26 11:00:00+01	Inv. 110124	Received gold sheet 750/- from Germany	22.710		Beauty Bijoux	2025-10-07 10:40:35.617881+02	2025-10-07 10:40:35.617881+02	0.000	\N	Beauty Bijoux
9cf2c7f7-672a-4a78-a554-055e1d3ed820	2024-11-26 11:00:00+01	30108974/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.619002+02	2025-10-07 10:40:35.619002+02	18.490	0.00	Beauty Bijoux
0806601a-3268-4f1c-8908-14b682902084	2024-11-26 11:00:00+01	30108975/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.620246+02	2025-10-07 10:40:35.620246+02	7.320	0.00	Beauty Bijoux
02bab5cd-0f40-4152-800e-f37fe9f872aa	2024-11-26 11:00:00+01	30108976/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.621359+02	2025-10-07 10:40:35.621359+02	3.560	0.00	Beauty Bijoux
249039a1-1e94-4695-93fd-6afd9aec3423	2024-11-27 11:00:00+01	Inv. 10824PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.622292+02	2025-10-07 10:40:35.622292+02	98.430	0.10	Beauty Bijoux
5e6c0135-226f-466b-82aa-fb8daffd2837	2024-11-27 11:00:00+01	Inv. 10924PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.62322+02	2025-10-07 10:40:35.62322+02	82.500	0.10	Beauty Bijoux
8505c423-df2e-4dfe-86e5-5fb1423e83e4	2024-11-27 11:00:00+01	Inv. 11024PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.62402+02	2025-10-07 10:40:35.62402+02	135.720	0.10	Beauty Bijoux
b83b8dff-abf7-4a3d-ba38-f4df4f215f0e	2024-11-27 11:00:00+01	Inv. 04324PH	Export to Poh Heng by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.624783+02	2025-10-07 10:40:35.624783+02	61.140	0.10	Beauty Bijoux
2bdaa3ae-fee4-4d86-8589-7007f6709e72	2024-11-27 11:00:00+01	Inv. 04424PH	Export to Poh Heng by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.625551+02	2025-10-07 10:40:35.625551+02	95.040	0.10	Beauty Bijoux
6008445e-55df-4482-992c-f82c4d1ee9ee	2024-11-27 11:00:00+01	Inv. 04524PH	Export to Poh Heng by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.630027+02	2025-10-07 10:40:35.630027+02	71.370	0.10	Beauty Bijoux
76db20b8-150a-4589-8a03-98dc8fc4b48a	2024-11-27 11:00:00+01	Inv. 04624PH	Export to Poh Heng by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.63127+02	2025-10-07 10:40:35.63127+02	78.210	0.10	Beauty Bijoux
03fc67d5-8b97-406b-b1e2-ed7079a86ea5	2024-11-27 11:00:00+01	Inv. 04724PH	Export to Poh Heng by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.632239+02	2025-10-07 10:40:35.632239+02	32.670	0.10	Beauty Bijoux
9406e8fe-9718-49f3-b861-7ce76c9c0fe0	2024-11-27 11:00:00+01	Inv. 04824PH	Export to Poh Heng by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.633096+02	2025-10-07 10:40:35.633096+02	66.590	0.10	Beauty Bijoux
28bd95d1-c3c8-4401-9e3e-8e0350edb5b0	2024-11-27 11:00:00+01	Inv. 04924PH	Export to Poh Heng by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.633921+02	2025-10-07 10:40:35.633921+02	52.230	0.10	Beauty Bijoux
d4396a25-6100-462c-b2c3-8414cb4fc242	2024-11-27 11:00:00+01	Inv. 05024PH	Export to Poh Heng by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.634858+02	2025-10-07 10:40:35.634858+02	48.020	0.10	Beauty Bijoux
aac37741-3dd7-464e-8c19-b7e60da84fe9	2024-11-27 11:00:00+01	Inv. 05124PH	Export to Poh Heng by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.635858+02	2025-10-07 10:40:35.635858+02	76.230	0.10	Beauty Bijoux
aa33ea23-b1a0-4be8-91df-86247ffb1dcc	2024-11-27 11:00:00+01	Inv. 05224PH	Export to Poh Heng by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.636983+02	2025-10-07 10:40:35.636983+02	88.080	0.10	Beauty Bijoux
784d0492-dfa4-4d7d-9f21-ca5fcd683374	2024-11-27 11:00:00+01	Inv. 05324PH	Export to Poh Heng by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.638099+02	2025-10-07 10:40:35.638099+02	50.490	0.10	Beauty Bijoux
6e46eb86-4fda-48f4-883e-f2b5f9af4420	2024-11-27 11:00:00+01	Inv. 05424PH	Export to Poh Heng by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.639044+02	2025-10-07 10:40:35.639044+02	38.870	0.10	Beauty Bijoux
a4ffd909-6696-45e4-bf45-d26a22461077	2024-11-27 11:00:00+01	Inv. 05524PH	Export to Poh Heng by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.640093+02	2025-10-07 10:40:35.640093+02	66.330	0.10	Beauty Bijoux
fa44b24b-c2b5-4143-879b-4cc4ec5261b6	2024-11-28 11:00:00+01	Inv. 11124PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.642127+02	2025-10-07 10:40:35.642127+02	339.080	0.10	Beauty Bijoux
593b1f11-0138-4e4e-b36f-532c91e53857	2024-11-29 11:00:00+01	Inv. 0462401	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.643171+02	2025-10-07 10:40:35.643171+02	39.350	\N	Beauty Bijoux
578c8392-fe45-4ca5-91da-c04808a228f3	2024-11-29 11:00:00+01	Inv. 11224PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.644066+02	2025-10-07 10:40:35.644066+02	22.940	0.10	Beauty Bijoux
396066c5-c473-4210-95c3-87afc06c0173	2024-11-29 11:00:00+01	Inv. 11324PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.645041+02	2025-10-07 10:40:35.645041+02	2.120	0.10	Beauty Bijoux
f5c8ed48-f7e5-46c8-9602-04e335fa16e1	2024-11-29 11:00:00+01	Inv. 11424PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.646164+02	2025-10-07 10:40:35.646164+02	2.180	0.10	Beauty Bijoux
d4a08942-3c86-4f3b-a501-e4bf4a0e98ac	2024-11-29 11:00:00+01	Inv. 11524PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.647367+02	2025-10-07 10:40:35.647367+02	2.020	0.10	Beauty Bijoux
e6095939-93ef-49c5-a032-c0febe9ca66a	2024-11-29 11:00:00+01	Inv. 11624PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.648298+02	2025-10-07 10:40:35.648298+02	8.350	0.10	Beauty Bijoux
9d31d133-3f14-4337-a9cd-0b723489f08b	2024-11-06 11:00:00+01	01224CN	Credit note	2.400		Beauty Bijoux	2025-10-07 10:40:35.649292+02	2025-10-07 10:40:35.649292+02	0.000	\N	Beauty Bijoux
3c3913c4-3f7f-444c-b8c0-a538afc1540f	2024-12-03 11:00:00+01	Inv. 110424	Received gold sheet 375/- from Germany	42.350		Beauty Bijoux	2025-10-07 10:40:35.650317+02	2025-10-07 10:40:35.650317+02	0.000	\N	Beauty Bijoux
6d06a280-9f86-40bf-94cf-4a5cf134fe1e	2024-12-03 11:00:00+01	Inv. 110424	Received accessories from Germany	5.830		Beauty Bijoux	2025-10-07 10:40:35.651204+02	2025-10-07 10:40:35.651204+02	0.000	\N	Beauty Bijoux
f77f15e2-3bc6-41f8-bcad-e89099ad24fc	2024-12-04 11:00:00+01	Inv. 00624MAC	Export to Maxi-Cash by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.65229+02	2025-10-07 10:40:35.65229+02	113.850	0.10	Beauty Bijoux
5c011674-54a9-4143-8572-76d83b1901b3	2024-12-06 11:00:00+01	Proforma 20241128JWD	Received Bracelet 18K WG for repair from Paspaley	8.880		Beauty Bijoux	2025-10-07 10:40:35.653279+02	2025-10-07 10:40:35.653279+02	0.000	\N	Beauty Bijoux
7676d865-9262-48e6-a8a6-fecabe951d9b	2024-12-06 11:00:00+01	Proforma 20241128JWD	Received Necklace 18K WG for repair from Paspaley	20.630		Beauty Bijoux	2025-10-07 10:40:35.654473+02	2025-10-07 10:40:35.654473+02	0.000	\N	Beauty Bijoux
810547e0-e8f7-4f7d-95f2-a7629f98d9c6	2024-12-06 11:00:00+01	Proforma 20241128JWD	Received Ring 18K for repair from Paspaley	8.970		Beauty Bijoux	2025-10-07 10:40:35.655463+02	2025-10-07 10:40:35.655463+02	0.000	\N	Beauty Bijoux
39f8c588-7238-4ec3-98dc-7be9b1595b5f	2024-12-07 11:00:00+01	Inv. 0472401	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.656272+02	2025-10-07 10:40:35.656272+02	18.480	\N	Beauty Bijoux
babe7239-9a19-478e-bc9d-4fc169c369b7	2024-12-09 11:00:00+01	Inv. 110624	Received accessories from Germany	38.380		Beauty Bijoux	2025-10-07 10:40:35.657073+02	2025-10-07 10:40:35.657073+02	0.000	\N	Beauty Bijoux
2bda0fd4-bbf5-4582-90b3-b93a192e9b16	2024-12-10 11:00:00+01	Inv. 06024HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.657872+02	2025-10-07 10:40:35.657872+02	107.250	0.10	Beauty Bijoux
a26e1816-ca65-472f-bae9-224a8644f11d	2024-12-10 11:00:00+01	30109896/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.658731+02	2025-10-07 10:40:35.658731+02	3.280	0.00	Beauty Bijoux
93eb9f4e-0078-4804-8804-7bd3b2fe9d80	2024-12-10 11:00:00+01	30109897/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.659646+02	2025-10-07 10:40:35.659646+02	0.730	0.00	Beauty Bijoux
55ab4a94-0362-4ac9-83a5-7f7dc03bdd8b	2024-12-10 11:00:00+01	30109898/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.660924+02	2025-10-07 10:40:35.660924+02	0.760	0.00	Beauty Bijoux
c8fa2613-ba28-4131-b379-b02d71a9ff0a	2024-12-10 11:00:00+01	30109899/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.662055+02	2025-10-07 10:40:35.662055+02	0.100	0.00	Beauty Bijoux
9b021de4-890a-4baf-8a72-6230df0b3d08	2024-12-10 11:00:00+01	30109900/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.663006+02	2025-10-07 10:40:35.663006+02	0.260	0.00	Beauty Bijoux
254f030a-d603-49c5-a21c-8b024fbf0d6f	2024-12-11 11:00:00+01	Inv. 11724PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.664021+02	2025-10-07 10:40:35.664021+02	95.300	0.10	Beauty Bijoux
07a585df-600d-487d-89eb-aa85a1dcb790	2024-12-11 11:00:00+01	Inv. 11824PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.665146+02	2025-10-07 10:40:35.665146+02	145.570	0.10	Beauty Bijoux
650ad9df-0757-4164-82c1-e73a0b8a2d13	2024-12-12 11:00:00+01	Inv. 11924PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.666151+02	2025-10-07 10:40:35.666151+02	18.410	0.10	Beauty Bijoux
4786556a-8c8e-47dd-af0b-2db760f652f4	2024-12-12 11:00:00+01	Inv. 12024PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.667324+02	2025-10-07 10:40:35.667324+02	70.790	0.10	Beauty Bijoux
80449d19-02a0-43f7-9b72-b34635a0ede8	2024-12-12 11:00:00+01	Inv. 12124PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.668598+02	2025-10-07 10:40:35.668598+02	107.010	0.10	Beauty Bijoux
ed434d5b-654a-438e-a898-03b25cf0046b	2024-12-12 11:00:00+01	Inv. 12224PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.66961+02	2025-10-07 10:40:35.66961+02	93.780	0.10	Beauty Bijoux
ee4d6ad2-b6f0-4408-8246-83a8753c9e7c	2024-12-12 11:00:00+01	Inv. 12324PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.67093+02	2025-10-07 10:40:35.67093+02	15.720	0.10	Beauty Bijoux
b5988849-ec85-4943-b866-526c53bcc099	2024-12-12 11:00:00+01	Inv. 06124HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.672212+02	2025-10-07 10:40:35.672212+02	192.230	0.10	Beauty Bijoux
8260419a-8366-4d8b-9388-090af8a7b868	2024-12-12 11:00:00+01	Inv. 06224HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.673268+02	2025-10-07 10:40:35.673268+02	119.630	0.10	Beauty Bijoux
f06840e3-6060-4c2e-9468-01b8cddb6bc6	2024-12-13 11:00:00+01	Inv. 12424PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.67512+02	2025-10-07 10:40:35.67512+02	20.870	0.10	Beauty Bijoux
72b39ca1-e6cb-430c-9deb-fef6f085e4a8	2024-12-13 11:00:00+01	Inv. 12524PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.676085+02	2025-10-07 10:40:35.676085+02	358.880	0.10	Beauty Bijoux
c0d2e4df-9893-4569-9fe6-56f34db074ce	2024-12-13 11:00:00+01	Inv. 06324HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.677172+02	2025-10-07 10:40:35.677172+02	164.840	0.10	Beauty Bijoux
61e7e5b6-380e-470b-8c54-00879240681f	2024-12-13 11:00:00+01	Inv. 06424HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.678224+02	2025-10-07 10:40:35.678224+02	34.040	0.10	Beauty Bijoux
e3aae773-b00f-4360-8713-7bacc5016f33	2024-12-13 11:00:00+01	Inv. 06524HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.679159+02	2025-10-07 10:40:35.679159+02	90.750	0.10	Beauty Bijoux
c1ad8f33-bef9-46cc-98ce-e837965f5eb1	2024-12-14 11:00:00+01	Inv. 0482401	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.679957+02	2025-10-07 10:40:35.679957+02	1.580	\N	Beauty Bijoux
d1e53cc1-2dfb-46bf-8fac-bcb64a204eb6	2024-12-16 11:00:00+01	Inv. 06624HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.68069+02	2025-10-07 10:40:35.68069+02	77.550	0.10	Beauty Bijoux
59818eef-f12a-46ab-88f0-25ab5d20c448	2024-12-16 11:00:00+01	Inv. 06724HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.681556+02	2025-10-07 10:40:35.681556+02	32.600	0.10	Beauty Bijoux
27f465af-c094-4a3a-aa4d-c51bfa073008	2024-12-16 11:00:00+01	Inv. 06824HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.682437+02	2025-10-07 10:40:35.682437+02	211.830	0.10	Beauty Bijoux
0eb205fb-858c-48fc-b8c3-7fe4633d4a87	2024-12-17 11:00:00+01	Inv. 110824	Received gold wire 750/- from Germany	87.690		Beauty Bijoux	2025-10-07 10:40:35.683358+02	2025-10-07 10:40:35.683358+02	0.000	\N	Beauty Bijoux
938f967f-e00d-46c5-ba4e-c6a7cf1e15f5	2024-12-17 11:00:00+01	Inv. 06924HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.684138+02	2025-10-07 10:40:35.684138+02	226.880	0.10	Beauty Bijoux
fdb167dd-c007-4ca2-9578-f420a2a637c1	2024-12-17 11:00:00+01	Inv. 07024HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.684835+02	2025-10-07 10:40:35.684835+02	86.630	0.10	Beauty Bijoux
d2de3728-699f-44b9-8a3e-da0115c04c79	2024-12-17 11:00:00+01	30110357/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.685588+02	2025-10-07 10:40:35.685588+02	21.340	0.00	Beauty Bijoux
3b7c25f1-ebe5-439a-bf26-0a217969af4c	2024-12-17 11:00:00+01	30110359/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.686452+02	2025-10-07 10:40:35.686452+02	5.870	0.00	Beauty Bijoux
9a8aee11-9769-4079-aecc-9bc2366e8591	2024-12-17 11:00:00+01	30110360/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.687751+02	2025-10-07 10:40:35.687751+02	3.890	0.00	Beauty Bijoux
9dbd7b9b-c5bf-4422-a8eb-01d7e585a0ea	2024-12-17 11:00:00+01	Inv. 12624PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.688917+02	2025-10-07 10:40:35.688917+02	118.800	0.10	Beauty Bijoux
a50e2dbf-0087-4919-86f5-7f12ec2b6217	2024-12-17 11:00:00+01	Inv. 12724PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.689917+02	2025-10-07 10:40:35.689917+02	141.330	0.10	Beauty Bijoux
f2e9de58-d30e-451b-8d96-18fab9aefd50	2024-12-17 11:00:00+01	Inv. 12824PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.690811+02	2025-10-07 10:40:35.690811+02	74.550	0.10	Beauty Bijoux
9bca24c6-2fde-48e2-bc65-29739b69a858	2024-12-17 11:00:00+01	Inv. 12924PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.691721+02	2025-10-07 10:40:35.691721+02	10.400	0.10	Beauty Bijoux
b2294036-bed6-47d1-87bb-bf1bccda8a0b	2024-12-17 11:00:00+01	Inv. 13024PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.693773+02	2025-10-07 10:40:35.693773+02	153.690	0.10	Beauty Bijoux
020952ba-1fc6-4f01-bcc6-7427e24358e4	2024-12-17 11:00:00+01	Inv. 13124PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.694673+02	2025-10-07 10:40:35.694673+02	69.890	0.10	Beauty Bijoux
e11e6074-6e5f-4118-a1ed-fef4e817de65	2024-12-17 11:00:00+01	Inv. 13224PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.695571+02	2025-10-07 10:40:35.695571+02	8.750	0.10	Beauty Bijoux
3423a05f-82f5-45ed-8c1f-6dc59959dae8	2024-12-17 11:00:00+01	Inv. 13324PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.696453+02	2025-10-07 10:40:35.696453+02	1.370	0.10	Beauty Bijoux
21ec6f68-8482-4551-9a2b-f9c7c8f97b4e	2024-12-18 11:00:00+01	Inv. 07124HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.697279+02	2025-10-07 10:40:35.697279+02	186.050	0.10	Beauty Bijoux
ce4f5158-595c-4cd7-bb27-46c12d4fe876	2024-12-18 11:00:00+01	Inv. 07224HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.698378+02	2025-10-07 10:40:35.698378+02	155.520	0.10	Beauty Bijoux
0253d98f-69c3-4c81-a6f4-2c222ab43c45	2024-12-18 11:00:00+01	Inv. 13424PPY	Export to Paspaley by DHL (Charge for repaired ring18K from proforma 20241128JWD)	8.970		Beauty Bijoux	2025-10-07 10:40:35.699517+02	2025-10-07 10:40:35.699517+02	0.000	\N	Beauty Bijoux
b2d8e54a-d6f1-435d-aa7d-5137e2762ce6	2024-12-18 11:00:00+01	Inv. 13524PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.70035+02	2025-10-07 10:40:35.70035+02	28.310	0.10	Beauty Bijoux
8184fc98-d13b-4bd8-ad54-c348d3e01582	2024-12-18 11:00:00+01	Inv. 13624PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.701102+02	2025-10-07 10:40:35.701102+02	2.190	0.10	Beauty Bijoux
9a7e6506-73d7-4f7e-9ac5-978660798f37	2024-12-18 11:00:00+01	Inv. 13724PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.701842+02	2025-10-07 10:40:35.701842+02	15.750	0.10	Beauty Bijoux
2504e52d-1654-4fd5-a3bd-490ddc0a73ca	2024-12-18 11:00:00+01	Inv. 13824PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.702653+02	2025-10-07 10:40:35.702653+02	3.540	0.10	Beauty Bijoux
ed390b06-a34a-4fee-ab20-7ecd91f28449	2024-12-18 11:00:00+01	Inv. 13924PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.703632+02	2025-10-07 10:40:35.703632+02	8.860	0.10	Beauty Bijoux
e7f684bc-244d-4987-977b-335733f78ad6	2024-12-18 11:00:00+01	Inv. 14024PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.704787+02	2025-10-07 10:40:35.704787+02	2.850	0.10	Beauty Bijoux
d1e5eb3c-f708-4c7c-b337-3a1a3645335e	2024-12-19 11:00:00+01	Inv. 07324HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.705628+02	2025-10-07 10:40:35.705628+02	179.450	0.10	Beauty Bijoux
c9f5d31d-80e5-40d5-b5c9-16f7bec02055	2024-12-19 11:00:00+01	Inv. 07424HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.706373+02	2025-10-07 10:40:35.706373+02	48.270	0.10	Beauty Bijoux
e4bc034d-7afb-447a-b18d-cf8b6dd9a0a5	2024-12-19 11:00:00+01	Inv. 07524HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.707177+02	2025-10-07 10:40:35.707177+02	29.700	0.10	Beauty Bijoux
57ce90d4-4786-4993-a3f7-a07512cda5c9	2024-12-19 11:00:00+01	Inv. 07624HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.708081+02	2025-10-07 10:40:35.708081+02	45.300	0.10	Beauty Bijoux
3b5100b6-5246-4671-9aa4-0e9aaf10b97f	2024-12-19 11:00:00+01	Inv. 14124PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.709016+02	2025-10-07 10:40:35.709016+02	11.390	0.10	Beauty Bijoux
bad2bca5-42ca-4845-ba3c-23026f4ab9fa	2024-12-19 11:00:00+01	Inv. 14224PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.710124+02	2025-10-07 10:40:35.710124+02	151.020	0.10	Beauty Bijoux
a03b5a80-556c-4f0e-9e92-23ab869c5752	2024-12-19 11:00:00+01	Inv. 14324PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.71112+02	2025-10-07 10:40:35.71112+02	30.500	0.10	Beauty Bijoux
40dc14bf-bc15-48a1-83ee-8f1afea4c3f7	2024-12-19 11:00:00+01	Inv. 0482401	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.712122+02	2025-10-07 10:40:35.712122+02	3.470	\N	Beauty Bijoux
f82596eb-5a54-4875-8438-8f308cb5d69c	2025-01-06 11:00:00+01	Proforma 20241205JWD	Received sample wide chain ring 18K from Paspaley	2.280		Beauty Bijoux	2025-10-07 10:40:35.713064+02	2025-10-07 10:40:35.713064+02	0.000	\N	Beauty Bijoux
c2483601-b047-49bb-a30b-3aab24fb5eae	2025-01-06 11:00:00+01	Proforma 20241205JWD	Received sample chain for rondelles 18K from Paspaley	1.290		Beauty Bijoux	2025-10-07 10:40:35.714002+02	2025-10-07 10:40:35.714002+02	0.000	\N	Beauty Bijoux
0bd4b8cc-d9f7-41e8-998e-e550e5d4bb51	2025-01-10 11:00:00+01	Inv. 00125ART	Export to Artistry by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.715048+02	2025-10-07 10:40:35.715048+02	48.060	0.10	Beauty Bijoux
a26e9753-0099-43c6-8ec7-6151ff923d1a	2025-01-10 11:00:00+01	Proforma 20250103JWD	Received broken chain 18K for repair from Paspaley	19.240		Beauty Bijoux	2025-10-07 10:40:35.715992+02	2025-10-07 10:40:35.715992+02	0.000	\N	Beauty Bijoux
9068d4d9-d4d6-4451-8999-e2b69d20306b	2025-01-10 11:00:00+01	30111175/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.716898+02	2025-10-07 10:40:35.716898+02	1.450	0.00	Beauty Bijoux
84871cd6-52e2-43aa-9c30-5ca8f8caa552	2025-01-10 11:00:00+01	30111176/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.717821+02	2025-10-07 10:40:35.717821+02	0.230	0.00	Beauty Bijoux
d58ce1ce-b179-4f71-a411-453aa94c7f48	2025-01-10 11:00:00+01	30111178/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.718776+02	2025-10-07 10:40:35.718776+02	0.310	0.00	Beauty Bijoux
7ef10eb6-2c9c-4f3c-a509-9e8603e35039	2025-01-10 11:00:00+01	30111179/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.72014+02	2025-10-07 10:40:35.72014+02	0.060	0.00	Beauty Bijoux
fa5b96e3-a78d-429e-8835-bf0dc95d083d	2025-01-10 11:00:00+01	30111180/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.721635+02	2025-10-07 10:40:35.721635+02	0.130	0.00	Beauty Bijoux
5f35684d-c731-4c92-b07d-08c1a7918a39	2025-01-11 11:00:00+01	Inv. 0012501	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.722571+02	2025-10-07 10:40:35.722571+02	1.020	\N	Beauty Bijoux
1f0e8175-0a9b-4e9a-b700-ab48c76fa97b	2025-01-13 11:00:00+01	HPO2402380	Received pendant for repair 18K from Poh Heng	3.740		Beauty Bijoux	2025-10-07 10:40:35.72338+02	2025-10-07 10:40:35.72338+02	0.000	\N	Beauty Bijoux
7dd1ab7b-8ab4-476e-b965-28ef84d71fd5	2025-01-15 11:00:00+01	Inv. 100225	Received accessories from Germany	72.490		Beauty Bijoux	2025-10-07 10:40:35.724283+02	2025-10-07 10:40:35.724283+02	0.000	\N	Beauty Bijoux
d648df9b-6ac6-4846-a358-eacb48471610	2025-01-15 11:00:00+01	Inv. 100225	Received gold sheet 375/- from Germany	65.800		Beauty Bijoux	2025-10-07 10:40:35.725197+02	2025-10-07 10:40:35.725197+02	0.000	\N	Beauty Bijoux
7fce25fe-e4d3-4016-b31a-2317a45c697e	2025-01-15 11:00:00+01	Inv. 100325	Received fine gold from Germany	3000.000		Beauty Bijoux	2025-10-07 10:40:35.725973+02	2025-10-07 10:40:35.725973+02	0.000	\N	Beauty Bijoux
40a31878-cbd7-47a9-94b2-8540f4f62361	2025-01-15 11:00:00+01	Inv. 00125HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.72679+02	2025-10-07 10:40:35.72679+02	210.380	0.10	Beauty Bijoux
0fd5f6c5-a88e-4da3-bb46-42454c68dbd7	2025-01-15 11:00:00+01	Inv. 00225HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.728758+02	2025-10-07 10:40:35.728758+02	144.380	0.10	Beauty Bijoux
305ea086-096a-4c7d-8506-6ced08c388bd	2025-01-16 11:00:00+01	Inv. 00325HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.729636+02	2025-10-07 10:40:35.729636+02	54.450	0.10	Beauty Bijoux
9ee663da-4b35-4876-8314-e1251d9ee7c5	2025-01-16 11:00:00+01	Inv. 00425HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.730622+02	2025-10-07 10:40:35.730622+02	103.950	0.10	Beauty Bijoux
e2d2ea66-3f9b-4fa9-9e8a-c0e4d6ace603	2025-01-16 11:00:00+01	Inv. 00125SP	Export to Aspial by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.731614+02	2025-10-07 10:40:35.731614+02	1.160	0.10	Beauty Bijoux
dde5d70f-fa6b-4978-bb8a-a2f6b5cc4998	2025-01-16 11:00:00+01	Inv. 00225SP	Export to Aspial by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.732477+02	2025-10-07 10:40:35.732477+02	4.040	0.10	Beauty Bijoux
ca9ca92e-0b7d-4aa4-b4ed-8aa3349417f5	2025-01-16 11:00:00+01	Inv. 00325SP	Export to Aspial by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.733299+02	2025-10-07 10:40:35.733299+02	4.240	0.10	Beauty Bijoux
a0a7a742-3834-4696-a0bd-1a4bb93e32d3	2025-01-16 11:00:00+01	Inv. 00425SP	Export to Aspial by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.73414+02	2025-10-07 10:40:35.73414+02	9.700	0.10	Beauty Bijoux
1d98e927-52f0-4a59-81d8-cb8b9477c585	2025-01-16 11:00:00+01	Inv. 00525SP	Export to Aspial by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.735179+02	2025-10-07 10:40:35.735179+02	2.310	0.10	Beauty Bijoux
b244a627-562d-41b5-9c6a-c30f8cfd25fc	2025-01-16 11:00:00+01	Inv. 00625SP	Export to Aspial by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.736429+02	2025-10-07 10:40:35.736429+02	4.460	0.10	Beauty Bijoux
dc64dee7-9748-4e1c-9ce5-adc75417b0fd	2025-01-16 11:00:00+01	Inv. 00725SP	Export to Aspial by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.73769+02	2025-10-07 10:40:35.73769+02	2.080	0.10	Beauty Bijoux
b58e96cd-540b-46af-a267-dd0de0d806e8	2025-01-16 11:00:00+01	Inv. 00825SP	Export to Aspial by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.738849+02	2025-10-07 10:40:35.738849+02	6.040	0.10	Beauty Bijoux
c7eff606-a776-4f9a-9530-a8bd7ef97503	2025-01-17 11:00:00+01	Inv. 00225PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.73989+02	2025-10-07 10:40:35.73989+02	82.430	0.10	Beauty Bijoux
17a02ac9-a9e4-4ca0-8321-63f6d744601f	2025-01-17 11:00:00+01	Inv. 00325PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.740843+02	2025-10-07 10:40:35.740843+02	84.100	0.10	Beauty Bijoux
85fee236-6e40-45df-9bd3-552cc73e348e	2025-01-17 11:00:00+01	Inv. 00425PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.741943+02	2025-10-07 10:40:35.741943+02	69.400	0.10	Beauty Bijoux
d9b8e500-11f0-4683-9b72-ffa051ad1da0	2025-01-17 11:00:00+01	Inv. 00525PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.746033+02	2025-10-07 10:40:35.746033+02	50.090	0.10	Beauty Bijoux
543090bc-31a2-422e-ade0-1c19f75817f9	2025-01-17 11:00:00+01	Inv. 00625PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.747065+02	2025-10-07 10:40:35.747065+02	7.190	0.10	Beauty Bijoux
3ad36704-aa6b-414d-b6e0-3a4d1e3eb9a8	2025-01-17 11:00:00+01	Inv. 00725PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.747852+02	2025-10-07 10:40:35.747852+02	82.700	0.10	Beauty Bijoux
f98883f3-ff7d-4bf7-a372-c5b7618e4298	2025-01-17 11:00:00+01	Inv. 00825PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.748609+02	2025-10-07 10:40:35.748609+02	154.700	0.10	Beauty Bijoux
a2e29a4e-ea97-4b1f-9de2-306d47247711	2025-01-17 11:00:00+01	Inv. 00925PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.749381+02	2025-10-07 10:40:35.749381+02	2.170	0.10	Beauty Bijoux
398346d5-e934-4938-b545-6f8429fc8672	2025-01-17 11:00:00+01	Inv. 01025PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.750163+02	2025-10-07 10:40:35.750163+02	2.050	0.10	Beauty Bijoux
88e4ef93-51d1-4d3e-b37b-220dacbcd87c	2025-01-17 11:00:00+01	Inv. 01125PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.751083+02	2025-10-07 10:40:35.751083+02	3.390	0.10	Beauty Bijoux
1c1796e3-37fd-49eb-86c7-5c5824232fe2	2025-01-17 11:00:00+01	Inv. 01225PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.752119+02	2025-10-07 10:40:35.752119+02	1.400	0.10	Beauty Bijoux
4ec43faf-43bc-41a9-bc35-464d7e68cdf1	2025-01-18 11:00:00+01	Inv. 0022501	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.753479+02	2025-10-07 10:40:35.753479+02	2.270	\N	Beauty Bijoux
3c876561-5dd9-4ff8-bd51-31ac98b71aa2	2025-01-18 11:00:00+01	Inv. 0022501	Charged gold sheet 585/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.754721+02	2025-10-07 10:40:35.754721+02	0.790	\N	Beauty Bijoux
9c987507-31ea-488d-81ca-7dd269b8dea0	2025-01-20 11:00:00+01	Inv. 01325PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.755771+02	2025-10-07 10:40:35.755771+02	4.240	0.10	Beauty Bijoux
8d1bce77-98a6-4c54-aae1-d9eaf618e2ba	2025-01-20 11:00:00+01	Inv. 01425PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.756911+02	2025-10-07 10:40:35.756911+02	127.050	0.10	Beauty Bijoux
29468112-6144-43c2-a014-4ca4f2da008a	2025-01-20 11:00:00+01	Inv. 01525PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.758054+02	2025-10-07 10:40:35.758054+02	202.780	0.10	Beauty Bijoux
ec742f11-293e-45d1-99ae-243d3dbda25a	2025-01-20 11:00:00+01	Inv. 01625PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.75895+02	2025-10-07 10:40:35.75895+02	34.420	0.10	Beauty Bijoux
6fe7ff56-79df-4ee2-9330-c73a3ef18daf	2025-01-21 11:00:00+01	Inv. 100525	Received accessories from Germany	0.310		Beauty Bijoux	2025-10-07 10:40:35.759969+02	2025-10-07 10:40:35.759969+02	0.000	\N	Beauty Bijoux
c1c028fc-420e-498c-9dec-846f4e5b7db1	2025-01-23 11:00:00+01	Proforma 20250116JWD	Received pendant 18K for repair  from Paspaley	0.540		Beauty Bijoux	2025-10-07 10:40:35.76097+02	2025-10-07 10:40:35.76097+02	0.000	\N	Beauty Bijoux
0460c151-76fc-4ae9-8540-281d602f517b	2025-01-23 11:00:00+01	30111974/02/01-02	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.761875+02	2025-10-07 10:40:35.761875+02	18.010	0.00	Beauty Bijoux
5ef1a63a-82ae-41a7-ad54-e87d158f1d5b	2025-01-23 11:00:00+01	30111975/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.762805+02	2025-10-07 10:40:35.762805+02	6.160	0.00	Beauty Bijoux
fae8741f-cea3-40a0-bd33-52fef191cdd3	2025-01-23 11:00:00+01	30111977/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.763682+02	2025-10-07 10:40:35.763682+02	2.700	0.00	Beauty Bijoux
b0045fae-e065-4ac4-8cdf-45752134e6cd	2025-01-25 11:00:00+01	Inv. 0032501	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.764533+02	2025-10-07 10:40:35.764533+02	12.700	\N	Beauty Bijoux
42da9d6d-9b7d-4b29-85a5-995ab64b49ba	2025-01-28 11:00:00+01	30111231/02/01 30111940/02/01	Refining charged sweep from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.765284+02	2025-10-07 10:40:35.765284+02	113.320	0.00	Beauty Bijoux
17ad3f21-2abb-4658-b0a2-e0f098fe5ae8	2025-01-28 11:00:00+01	Inv. 100725	Received gold sheet 375/- from Germany	55.170		Beauty Bijoux	2025-10-07 10:40:35.765995+02	2025-10-07 10:40:35.765995+02	0.000	\N	Beauty Bijoux
47f5e1c9-b52d-4c57-a87a-71888f068c19	2025-01-31 11:00:00+01	Inv. 01725PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.766691+02	2025-10-07 10:40:35.766691+02	2.410	0.10	Beauty Bijoux
b51119b0-17be-454b-a772-e0ec33a220eb	2025-01-31 11:00:00+01	Inv. 01825PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.767453+02	2025-10-07 10:40:35.767453+02	309.480	0.10	Beauty Bijoux
2ab992f0-ced9-4426-822a-deb7645b6745	2025-01-31 11:00:00+01	Inv. 01925PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.768327+02	2025-10-07 10:40:35.768327+02	330.570	0.10	Beauty Bijoux
a9086114-9960-4914-904f-c69b3b82a84a	2025-01-31 11:00:00+01	Inv. 02025PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.769187+02	2025-10-07 10:40:35.769187+02	106.230	0.10	Beauty Bijoux
883537a4-3cfd-4590-9922-977593b231fa	2025-01-31 11:00:00+01	Inv. 02125PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.770322+02	2025-10-07 10:40:35.770322+02	0.530	0.10	Beauty Bijoux
e6dc6ba2-6513-4ca4-81f7-7bcb29a0f4d5	2025-01-31 11:00:00+01	Inv. 00525HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.771534+02	2025-10-07 10:40:35.771534+02	162.360	0.10	Beauty Bijoux
6ea61b47-1c85-4e65-83e0-e3c8fdb06237	2025-01-31 11:00:00+01	Inv. 00625HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.772652+02	2025-10-07 10:40:35.772652+02	36.300	0.10	Beauty Bijoux
fbe38097-34de-4c77-a1c1-a653cb730bf2	2025-02-01 11:00:00+01	Inv. 0042501	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.773588+02	2025-10-07 10:40:35.773588+02	4.340	\N	Beauty Bijoux
d6af31f7-2632-4f00-bd18-16673fb60374	2025-02-01 11:00:00+01	Inv. 0042501	Charged gold sheet 333/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.774458+02	2025-10-07 10:40:35.774458+02	0.300	\N	Beauty Bijoux
8879f791-8586-4f34-a9f4-f7d21fd38666	2025-02-03 11:00:00+01	Proforma Inv. 03/02-2025	Export to Poh Heng by FedEx (Return pendant from repair 18K (HPO2402380))	4.120		Beauty Bijoux	2025-10-07 10:40:35.775407+02	2025-10-07 10:40:35.775407+02	0.000	\N	Beauty Bijoux
f1198504-aabb-48a9-a172-22d075677d81	2025-02-04 11:00:00+01	Inv. 100925	Received fine gold from Germany	3000.000		Beauty Bijoux	2025-10-07 10:40:35.776304+02	2025-10-07 10:40:35.776304+02	0.000	\N	Beauty Bijoux
38ad4a59-ce7c-46cf-b6cf-72de2f44b54b	2025-02-04 11:00:00+01	Inv. 101025	Received accessories from Germany	0.340		Beauty Bijoux	2025-10-07 10:40:35.777191+02	2025-10-07 10:40:35.777191+02	0.000	\N	Beauty Bijoux
828d605f-3fbd-423d-9fa3-d087a62817f3	2025-02-05 11:00:00+01	Inv. 68-0357	Purchased Medium Soldering for Yellow Gold 14KT (LSG409) from NOBLE MIND	133.520		Beauty Bijoux	2025-10-07 10:40:35.778072+02	2025-10-07 10:40:35.778072+02	0.000	\N	Beauty Bijoux
1f765482-09e0-4745-b8ab-160a93258624	2025-02-05 11:00:00+01	Tax Inv. 002RSI174810	Purchased Chain 1.75mm 18K WG	1.590		Beauty Bijoux	2025-10-07 10:40:35.779036+02	2025-10-07 10:40:35.779036+02	0.000	\N	Beauty Bijoux
2a47cd67-2b6c-482d-8c48-5d9cc569621e	2025-02-05 11:00:00+01	Tax Inv. 002RSI174810	Purchased Chain 1.1mm 18K WG	0.690		Beauty Bijoux	2025-10-07 10:40:35.780047+02	2025-10-07 10:40:35.780047+02	0.000	\N	Beauty Bijoux
45de1542-497f-449e-a015-1b0cbd94f8c4	2025-02-05 11:00:00+01	Tax Inv. 002RSI174810	Purchased Chain 1.5mm 18K YG	1.290		Beauty Bijoux	2025-10-07 10:40:35.780929+02	2025-10-07 10:40:35.780929+02	0.000	\N	Beauty Bijoux
f52788d4-84a0-46dd-a2d6-2f6105397a1f	2025-02-07 11:00:00+01	30113241/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.782005+02	2025-10-07 10:40:35.782005+02	1.840	0.00	Beauty Bijoux
d078d723-9c6b-413d-9c0f-35a513a0f1d4	2025-02-07 11:00:00+01	30113244/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.782795+02	2025-10-07 10:40:35.782795+02	0.600	0.00	Beauty Bijoux
38a75d7f-e6a7-4c03-b34c-2a73f36d03b0	2025-02-07 11:00:00+01	30113245/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.783653+02	2025-10-07 10:40:35.783653+02	0.950	0.00	Beauty Bijoux
c360a6f8-dad8-465c-b191-9bff80f4efe2	2025-02-07 11:00:00+01	30113246/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.784463+02	2025-10-07 10:40:35.784463+02	0.080	0.00	Beauty Bijoux
da725213-da25-4df0-a81e-b5106b86bc3e	2025-02-07 11:00:00+01	30113248/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.785296+02	2025-10-07 10:40:35.785296+02	0.160	0.00	Beauty Bijoux
adc84ba4-df1b-47a3-89e0-9abc1978c7ef	2025-02-08 11:00:00+01	Inv. 0052501	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.786105+02	2025-10-07 10:40:35.786105+02	9.900	\N	Beauty Bijoux
4712e438-8f9c-400e-b10f-13bb070472e6	2025-02-11 11:00:00+01	Inv. 101225	Received accessories from Germany	7.540		Beauty Bijoux	2025-10-07 10:40:35.787014+02	2025-10-07 10:40:35.787014+02	0.000	\N	Beauty Bijoux
ffa63065-8ee6-4090-8735-484064d04946	2025-02-12 11:00:00+01	Inv. 00725HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.788141+02	2025-10-07 10:40:35.788141+02	148.920	0.10	Beauty Bijoux
d6a3171f-dab2-44cc-a444-10a61709dfef	2025-02-12 11:00:00+01	Inv. 00825HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.789052+02	2025-10-07 10:40:35.789052+02	105.600	0.10	Beauty Bijoux
026d0e3f-507d-446c-9ac7-fa13101afe48	2025-02-13 11:00:00+01	Inv. 02225PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.789954+02	2025-10-07 10:40:35.789954+02	2.190	0.10	Beauty Bijoux
17756f95-a06b-407c-ab86-9006bbad1f36	2025-02-13 11:00:00+01	Inv. 02325PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.791048+02	2025-10-07 10:40:35.791048+02	17.540	0.10	Beauty Bijoux
15e39ebb-b009-4ffc-b959-915b775d23e5	2025-02-13 11:00:00+01	Inv. 02425PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.791994+02	2025-10-07 10:40:35.791994+02	136.950	0.10	Beauty Bijoux
ab773a6d-d2dd-4b7d-9901-944121fce454	2025-02-15 11:00:00+01	Inv. 0062501	Charged accessories 585/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.793942+02	2025-10-07 10:40:35.793942+02	0.210	\N	Beauty Bijoux
ffc6bfe8-08af-4d19-ba10-d9c334a1a97b	2025-02-17 11:00:00+01	30113772/02/01-02	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.794905+02	2025-10-07 10:40:35.794905+02	21.160	0.00	Beauty Bijoux
4fe4f994-0810-4ea1-a264-abb52339a3df	2025-02-17 11:00:00+01	30113774/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.796034+02	2025-10-07 10:40:35.796034+02	8.510	0.00	Beauty Bijoux
414a2d2d-00ec-4f63-b080-59403e7948b8	2025-02-17 11:00:00+01	30113775/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.797051+02	2025-10-07 10:40:35.797051+02	3.840	0.00	Beauty Bijoux
52d43f57-5bb4-4a68-b9c3-29db33dc7e3c	2025-02-18 11:00:00+01	Inv. 101425	Received accessories from Germany	1.770		Beauty Bijoux	2025-10-07 10:40:35.797966+02	2025-10-07 10:40:35.797966+02	0.000	\N	Beauty Bijoux
fc53cba2-a764-4d2f-a277-b8e5d12f52be	2025-02-18 11:00:00+01	IV2502-021	Purchased K18 Lobster 10mm "P+750" from Nakagawa	13.260		Beauty Bijoux	2025-10-07 10:40:35.798804+02	2025-10-07 10:40:35.798804+02	0.000	\N	Beauty Bijoux
f3ec07fc-27e0-47e3-9060-25fa30402c9a	2025-02-18 11:00:00+01	IV2502-021	Purchased K18WGPD5 Lobster 10mm "P+750" NFRP from Nakagawa	13.710		Beauty Bijoux	2025-10-07 10:40:35.799726+02	2025-10-07 10:40:35.799726+02	0.000	\N	Beauty Bijoux
6fd87a2f-eb75-444e-9e8b-ced6685c5ed5	2025-02-18 11:00:00+01	IV2502-021	Purchased K18YG LS4mm Slide Bead with PNK-15(V) from Nakagawa	6.170		Beauty Bijoux	2025-10-07 10:40:35.800704+02	2025-10-07 10:40:35.800704+02	0.000	\N	Beauty Bijoux
45cb2d37-6797-473e-8f03-d7570f1a9380	2025-02-18 11:00:00+01	IV2502-021	Purchased K18WGPd5 LS4mm Slide Bead with PNK-15(V) NFRP from Nakagawa	6.480		Beauty Bijoux	2025-10-07 10:40:35.80162+02	2025-10-07 10:40:35.80162+02	0.000	\N	Beauty Bijoux
09f23bdc-534f-4036-a020-a7478931b46c	2025-02-19 11:00:00+01	Inv. 02525PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.802572+02	2025-10-07 10:40:35.802572+02	27.150	0.10	Beauty Bijoux
aa1b1ace-0a90-47c9-a253-203c13193083	2025-02-19 11:00:00+01	Inv. 02625PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.803783+02	2025-10-07 10:40:35.803783+02	708.320	0.10	Beauty Bijoux
8f037838-b6dd-4c18-aaa4-e2115af468cb	2025-02-19 11:00:00+01	Inv. 02725PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.805054+02	2025-10-07 10:40:35.805054+02	55.440	0.10	Beauty Bijoux
f7a6b3bf-c613-44af-8e1a-d2895467cfc1	2025-02-19 11:00:00+01	HN907010	Received broken earrings pin with pearl 18K YG 1.27 grs for repair from QI (Bangkok) (Without document from customer and charge only labor)	0.000		Beauty Bijoux	2025-10-07 10:40:35.806312+02	2025-10-07 10:40:35.806312+02	0.000	\N	Beauty Bijoux
83b3364b-93db-430a-871c-955df2f24277	2025-02-20 11:00:00+01	Inv. 00925HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.809756+02	2025-10-07 10:40:35.809756+02	155.730	0.10	Beauty Bijoux
37929a1f-f5f0-4832-8721-6ab11da5587e	2025-02-20 11:00:00+01	Inv. 01025HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.810586+02	2025-10-07 10:40:35.810586+02	82.500	0.10	Beauty Bijoux
2255dd6f-9531-464d-a8d7-5fae216ef44d	2025-02-20 11:00:00+01	Inv. 25001014	Purchased 750S2 WG from Umicore	75.000		Beauty Bijoux	2025-10-07 10:40:35.81141+02	2025-10-07 10:40:35.81141+02	0.000	\N	Beauty Bijoux
07e53f2b-0535-44b4-8ac8-c88828f97e40	2025-02-21 11:00:00+01	Inv. 01125HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.81238+02	2025-10-07 10:40:35.81238+02	85.800	0.10	Beauty Bijoux
7590ba46-06c0-49fa-a07f-0d31e0be2f92	2025-02-21 11:00:00+01	Inv. 0072501	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.813164+02	2025-10-07 10:40:35.813164+02	16.530	\N	Beauty Bijoux
9cccea80-52bd-4364-b609-0811fc1aa3ec	2025-02-21 11:00:00+01	Inv. 0072501	Charged accessories 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.81399+02	2025-10-07 10:40:35.81399+02	0.590	\N	Beauty Bijoux
5d437337-4b78-4786-97c1-e456d6d07043	2025-02-22 11:00:00+01	Inv. 0072502	Charged accessories 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.814878+02	2025-10-07 10:40:35.814878+02	1.200	\N	Beauty Bijoux
b8d8260e-9a24-4639-928f-e4321995a8bf	2025-02-25 11:00:00+01	Inv. 101825	Received gold sheet 375/- from Germany	40.230		Beauty Bijoux	2025-10-07 10:40:35.81575+02	2025-10-07 10:40:35.81575+02	0.000	\N	Beauty Bijoux
e229394e-d7ea-4d0b-b119-e24f9b1ac5f0	2025-02-25 11:00:00+01	Inv. 101825	Received accessories from Germany	1.470		Beauty Bijoux	2025-10-07 10:40:35.818049+02	2025-10-07 10:40:35.818049+02	0.000	\N	Beauty Bijoux
2991aecf-923a-4d5e-a73d-ffe264416411	2025-02-27 11:00:00+01	IV2502-038	Purchased K18YG 230SDC4 from Nakagawa	73.560		Beauty Bijoux	2025-10-07 10:40:35.818944+02	2025-10-07 10:40:35.818944+02	0.000	\N	Beauty Bijoux
dd9a7758-ec9d-4672-87af-78d50800b69b	2025-02-27 11:00:00+01	IV2502-038	Purchased K18WGPd10 230SDC4 from Nakagawa	81.560		Beauty Bijoux	2025-10-07 10:40:35.819891+02	2025-10-07 10:40:35.819891+02	0.000	\N	Beauty Bijoux
0e9cfbcb-aa44-453e-9f68-874c5fad418c	2025-02-28 11:00:00+01	Inv. 02825PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.820877+02	2025-10-07 10:40:35.820877+02	18.010	0.10	Beauty Bijoux
dca53475-6bc1-4a07-a2e1-0adb6454586e	2025-02-28 11:00:00+01	Inv. 02925PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.823044+02	2025-10-07 10:40:35.823044+02	29.370	0.10	Beauty Bijoux
28aa0028-e901-4723-8d5f-599c3146a18b	2025-02-28 11:00:00+01	Inv. 03025PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.823998+02	2025-10-07 10:40:35.823998+02	0.530	0.10	Beauty Bijoux
6e4dee1a-2df5-4b60-8ab7-4bb2e03f0c38	2025-02-28 11:00:00+01	Inv. 03125PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.824895+02	2025-10-07 10:40:35.824895+02	2.470	0.10	Beauty Bijoux
1df248fc-14e0-4d10-aa8f-0d8749a7b137	2025-02-28 11:00:00+01	Inv. 03225PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.825673+02	2025-10-07 10:40:35.825673+02	1.450	0.10	Beauty Bijoux
1a1043ba-05d7-4b0d-a61a-218919df600b	2025-02-28 11:00:00+01	Inv. 0082501	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.826428+02	2025-10-07 10:40:35.826428+02	7.720	\N	Beauty Bijoux
33d8b9a3-7700-48e2-bc6c-5aada850a20d	2025-03-03 11:00:00+01	Proforma 20250221JWD	Received chain 18K for making sample from Paspaley	4.370		Beauty Bijoux	2025-10-07 10:40:35.827445+02	2025-10-07 10:40:35.827445+02	0.000	\N	Beauty Bijoux
24002b6b-2e5c-4712-9e06-0ec8540cfff9	2025-03-04 11:00:00+01	Inv. 102025	Received accessories from Germany	125.990		Beauty Bijoux	2025-10-07 10:40:35.82826+02	2025-10-07 10:40:35.82826+02	0.000	\N	Beauty Bijoux
b26263a4-624c-40a1-b753-c83d5d92ef98	2025-03-04 11:00:00+01	Inv. 102025	Received chain for cusromer 7540 from Germany	100.200		Beauty Bijoux	2025-10-07 10:40:35.829189+02	2025-10-07 10:40:35.829189+02	0.000	\N	Beauty Bijoux
b7a7a00c-6d50-4565-832f-82f5e28fbb9d	2025-03-05 11:00:00+01	IV2503-014	Purchased K18 Lavalier Crown with Silicone "Paspaley" from Nakagawa	17.850		Beauty Bijoux	2025-10-07 10:40:35.829987+02	2025-10-07 10:40:35.829987+02	0.000	\N	Beauty Bijoux
20961fa2-4273-4be5-8c07-dc4e1bd1b531	2025-03-06 11:00:00+01	HMI2500095_HPO2500208	Received accessories 18K from Poh Heng	15.060		Beauty Bijoux	2025-10-07 10:40:35.830881+02	2025-10-07 10:40:35.830881+02	0.000	\N	Beauty Bijoux
f0ffb4b1-df6c-4bef-b20e-3e5caa19f26f	2025-03-06 11:00:00+01	HMI2500096_HPO2500209	Received accessories 18K from Poh Heng	15.060		Beauty Bijoux	2025-10-07 10:40:35.831578+02	2025-10-07 10:40:35.831578+02	0.000	\N	Beauty Bijoux
5a085b33-5858-4eff-a7eb-122842455e45	2025-03-07 11:00:00+01	30115068/02/01-02	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.832387+02	2025-10-07 10:40:35.832387+02	19.240	0.00	Beauty Bijoux
f7766f12-5a2a-46a1-9949-b2bb66fbe369	2025-03-07 11:00:00+01	30115069/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.833219+02	2025-10-07 10:40:35.833219+02	10.570	0.00	Beauty Bijoux
6b1c5574-c833-40e5-bfba-6bf965c7cecd	2025-03-07 11:00:00+01	30115072/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.834168+02	2025-10-07 10:40:35.834168+02	3.080	0.00	Beauty Bijoux
f200b362-8641-4e9b-a796-7943c68dd09a	2025-03-07 11:00:00+01	30115077/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.835037+02	2025-10-07 10:40:35.835037+02	2.210	0.00	Beauty Bijoux
eaeabd1b-d615-4891-a706-d16cbf7415e6	2025-03-07 11:00:00+01	30115079/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.836004+02	2025-10-07 10:40:35.836004+02	0.700	0.00	Beauty Bijoux
691e4335-1a27-4e50-a08a-cf8409efec67	2025-03-07 11:00:00+01	30115082/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.837153+02	2025-10-07 10:40:35.837153+02	0.790	0.00	Beauty Bijoux
e7236de8-fbef-4308-98ee-cbe9be372b90	2025-03-07 11:00:00+01	30115083/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.838331+02	2025-10-07 10:40:35.838331+02	0.110	0.00	Beauty Bijoux
0eb577b7-26a5-4985-91a8-d44a650cca86	2025-03-07 11:00:00+01	30115085/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.839327+02	2025-10-07 10:40:35.839327+02	0.170	0.00	Beauty Bijoux
ed607d2d-ccca-49b4-bd17-ff4d72612860	2025-03-07 11:00:00+01	Inv. 0092501	Charged gold sheet 333/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.840262+02	2025-10-07 10:40:35.840262+02	0.260	\N	Beauty Bijoux
4a289425-15fc-4caf-9087-2ddf028a7361	2025-03-07 11:00:00+01	Inv. 0092501	Charged gold sheet 585/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.841134+02	2025-10-07 10:40:35.841134+02	0.240	\N	Beauty Bijoux
34d338d7-671c-4fa1-a75e-cab37b1cee6c	2025-03-07 11:00:00+01	Inv. 0092501	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.841963+02	2025-10-07 10:40:35.841963+02	2.210	\N	Beauty Bijoux
4c3917b8-1083-4221-9682-dff9c9dd1d0e	2025-03-08 11:00:00+01	Inv. 0092502	Charged gold sheet 333/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.84287+02	2025-10-07 10:40:35.84287+02	0.050	\N	Beauty Bijoux
f3619f65-e9fa-48f3-8338-12c917363db2	2025-03-08 11:00:00+01	Inv. 0092502	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.843815+02	2025-10-07 10:40:35.843815+02	1.280	\N	Beauty Bijoux
798f2cde-e672-44fe-beac-821ebc5f8e30	2025-03-11 11:00:00+01	Inv. 102225	Received gold sheet 375/- from Germany	140.240		Beauty Bijoux	2025-10-07 10:40:35.845685+02	2025-10-07 10:40:35.845685+02	0.000	\N	Beauty Bijoux
9a07f946-4369-470a-8798-bdc14570b5ce	2025-03-11 11:00:00+01	Inv. 102225	Received accessories from Germany	92.260		Beauty Bijoux	2025-10-07 10:40:35.846809+02	2025-10-07 10:40:35.846809+02	0.000	\N	Beauty Bijoux
2cb95343-02f8-480c-98da-0b4a7635c343	2025-03-13 11:00:00+01	IV2503-030	Purchased K18WGPD1.25 Lavalier Crown with Silicone "Paspaley" NFRP from Nakagawa	18.250		Beauty Bijoux	2025-10-07 10:40:35.847776+02	2025-10-07 10:40:35.847776+02	0.000	\N	Beauty Bijoux
c57ee8b3-f316-4925-b471-7ac67496f74f	2025-03-15 11:00:00+01	Inv. 0102501	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.848719+02	2025-10-07 10:40:35.848719+02	26.730	\N	Beauty Bijoux
fd05ad75-e3ee-4837-82a9-ede292b62c6c	2025-03-18 11:00:00+01	Inv. 102525	Received fine gold from Germany	3000.000		Beauty Bijoux	2025-10-07 10:40:35.849612+02	2025-10-07 10:40:35.849612+02	0.000	\N	Beauty Bijoux
48053ab1-5fc8-442e-b94b-1934ea4a524a	2025-03-18 11:00:00+01	Inv. 102625	Received accessories from Germany	167.070		Beauty Bijoux	2025-10-07 10:40:35.850514+02	2025-10-07 10:40:35.850514+02	0.000	\N	Beauty Bijoux
5e3b5b2f-82eb-476f-aea4-1d7614271d29	2025-03-19 11:00:00+01	Inv. 03325PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.851295+02	2025-10-07 10:40:35.851295+02	3.700	0.10	Beauty Bijoux
d191eaec-052e-43e0-a2b7-c1f2d9768bb8	2025-03-19 11:00:00+01	Inv. 03425PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.852115+02	2025-10-07 10:40:35.852115+02	646.560	0.10	Beauty Bijoux
0596185d-44c7-4b3d-ad57-ac935a3c7f3d	2025-03-21 11:00:00+01	Inv. 03525PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.853024+02	2025-10-07 10:40:35.853024+02	498.110	0.10	Beauty Bijoux
77f08d40-ab7b-4986-950d-2adc0ca928ac	2025-03-21 11:00:00+01	Inv. 03625PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.854227+02	2025-10-07 10:40:35.854227+02	44.550	0.10	Beauty Bijoux
e8c07ea6-0664-4cee-8e91-e785440083e2	2025-03-22 11:00:00+01	Inv. 0112501	Charged accessories 585/- BB Stock	0.210		Beauty Bijoux	2025-10-07 10:40:35.855298+02	2025-10-07 10:40:35.855298+02	0.000	\N	Beauty Bijoux
9390fdc4-9512-4c16-a1dd-0d8da68a6fb2	2025-03-22 11:00:00+01	Inv. 1012464	Export to Germany (PD GOLD)	0.000		Beauty Bijoux	2025-10-07 10:40:35.856173+02	2025-10-07 10:40:35.856173+02	2.290	0.10	Beauty Bijoux
7fbe2d2b-452b-4f9c-8e34-675332abcddb	2025-03-25 11:00:00+01	Inv. 102825	Received accessories from Germany	52.200		Beauty Bijoux	2025-10-07 10:40:35.856931+02	2025-10-07 10:40:35.856931+02	0.000	\N	Beauty Bijoux
65ab9bde-574f-4668-9e4e-a0295c6f4408	2025-03-25 11:00:00+01	Inv. 01325HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.857753+02	2025-10-07 10:40:35.857753+02	113.280	0.10	Beauty Bijoux
ae15c80f-d7e5-46ab-9ab4-78cdf9ddf776	2025-03-25 11:00:00+01	Inv. 01425HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.85863+02	2025-10-07 10:40:35.85863+02	131.180	0.10	Beauty Bijoux
79a9e492-8251-437d-a553-d364b52ee1c4	2025-03-26 11:00:00+01	Inv. 01525HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.859934+02	2025-10-07 10:40:35.859934+02	99.000	0.10	Beauty Bijoux
8745ed7a-b13d-4d98-917e-87cae34492d1	2025-03-26 11:00:00+01	Inv. 01625HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.861182+02	2025-10-07 10:40:35.861182+02	143.550	0.10	Beauty Bijoux
fe828c39-cbfa-48dc-bb89-92f56ba51886	2025-03-26 11:00:00+01	Inv. 00225ART	Export to Artistry by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.863099+02	2025-10-07 10:40:35.863099+02	12.390	0.10	Beauty Bijoux
02cc057e-306c-4be1-b39c-6c670731a9d8	2025-03-26 11:00:00+01	Inv. 00325ART	Export to Artistry by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.86425+02	2025-10-07 10:40:35.86425+02	48.010	0.10	Beauty Bijoux
6c67f279-9a66-48a6-921c-525f80c2c786	2025-03-27 11:00:00+01	Inv. 01725HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.870278+02	2025-10-07 10:40:35.870278+02	108.900	0.10	Beauty Bijoux
be726cb1-a739-4190-8357-7c39e61d6e22	2025-03-27 11:00:00+01	30116403/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.87171+02	2025-10-07 10:40:35.87171+02	25.500	0.00	Beauty Bijoux
acc4f86b-a282-4d4e-ae67-e4903f8bb525	2025-03-27 11:00:00+01	30116404/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.872768+02	2025-10-07 10:40:35.872768+02	8.430	0.00	Beauty Bijoux
3ec414ff-eb51-4fe4-a8c5-d3ae19649b01	2025-03-27 11:00:00+01	30116405/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.873634+02	2025-10-07 10:40:35.873634+02	2.870	0.00	Beauty Bijoux
566a0948-14d0-4561-84fe-b0764679fae0	2025-03-29 11:00:00+01	Inv. 0122502	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.874402+02	2025-10-07 10:40:35.874402+02	34.260	\N	Beauty Bijoux
f0750ce8-3251-426a-9c61-7048da7d5384	2025-04-01 12:00:00+02	Inv. 103025	Received accessories from Germany	37.410		Beauty Bijoux	2025-10-07 10:40:35.876303+02	2025-10-07 10:40:35.876303+02	0.000	\N	Beauty Bijoux
331a51c7-c677-4aed-8302-2ed483cfdee3	2025-04-01 12:00:00+02	Inv. 03725PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.8772+02	2025-10-07 10:40:35.8772+02	8.910	0.10	Beauty Bijoux
c388a8e7-ba64-46d8-aaaf-4e28fd25fdc9	2025-04-01 12:00:00+02	Inv. 03825PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.87806+02	2025-10-07 10:40:35.87806+02	28.520	0.10	Beauty Bijoux
9bffdd63-d4ce-4432-b59d-bc86ad0d21b1	2025-04-01 12:00:00+02	IV2504-004	Purchased K18YG 230SDC4 from Nakagawa	61.200		Beauty Bijoux	2025-10-07 10:40:35.878861+02	2025-10-07 10:40:35.878861+02	0.000	\N	Beauty Bijoux
57d219e6-2357-402e-a319-23fb874fe417	2025-04-01 12:00:00+02	IV2504-004	Purchased K18WGPd10 230SDC4 from Nakagawa	81.090		Beauty Bijoux	2025-10-07 10:40:35.87976+02	2025-10-07 10:40:35.87976+02	0.000	\N	Beauty Bijoux
e28e41e9-b45d-4e7c-8f80-72aa13aa5e8b	2025-04-01 12:00:00+02	IV2504-004	Purchased K18 Lobster 10mm "P+750" from Nakagawa	11.350		Beauty Bijoux	2025-10-07 10:40:35.880619+02	2025-10-07 10:40:35.880619+02	0.000	\N	Beauty Bijoux
60f9d83a-441e-4ceb-bcf7-f5388361661a	2025-04-01 12:00:00+02	IV2504-004	Purchased K18YG LS4mm Slide Bead with PNK-15(V) from Nakagawa	5.380		Beauty Bijoux	2025-10-07 10:40:35.881651+02	2025-10-07 10:40:35.881651+02	0.000	\N	Beauty Bijoux
3b862d0e-7671-417e-99f4-beca506dd0a9	2025-04-01 12:00:00+02	IV2504-004	Purchased K18WGPd5 LS4mm Slide Bead with PNK-15(V) NFRP from Nakagawa	6.480		Beauty Bijoux	2025-10-07 10:40:35.882794+02	2025-10-07 10:40:35.882794+02	0.000	\N	Beauty Bijoux
5322d8ec-3477-4a0f-b1b8-ad9b527aa1dc	2025-04-02 12:00:00+02	Inv. 03925PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.883828+02	2025-10-07 10:40:35.883828+02	2.450	0.10	Beauty Bijoux
f254b050-d293-4359-add0-ef8594e29417	2025-04-02 12:00:00+02	Inv. 04025PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:35.885059+02	2025-10-07 10:40:35.885059+02	3.080	0.10	Beauty Bijoux
4344b023-f861-482e-a8d5-33422e4b8ef9	2025-04-02 12:00:00+02	Inv. 00125MAC	Export to Maxi-Cash by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.886273+02	2025-10-07 10:40:35.886273+02	82.960	0.10	Beauty Bijoux
315f533b-cc4b-463d-b1ec-a1d13fa2c00c	2025-04-05 12:00:00+02	Inv. 0132501	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.887748+02	2025-10-07 10:40:35.887748+02	0.850	\N	Beauty Bijoux
e826ca95-3b42-468d-b7e7-33bf1abb2e67	2025-04-08 12:00:00+02	Inv. 00225PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.889032+02	2025-10-07 10:40:35.889032+02	78.470	0.10	Beauty Bijoux
bf85f2ac-41ae-469b-ba83-357fecf43c60	2025-04-08 12:00:00+02	Inv. 00325PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.890228+02	2025-10-07 10:40:35.890228+02	71.370	0.10	Beauty Bijoux
6cf58898-a5a2-4178-8c3a-d18f34192506	2025-04-08 12:00:00+02	Inv. 00425PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.891915+02	2025-10-07 10:40:35.891915+02	61.640	0.10	Beauty Bijoux
541ed560-ba97-49eb-ace0-6fc7082ee8d9	2025-04-08 12:00:00+02	Inv. 00525PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.893452+02	2025-10-07 10:40:35.893452+02	80.850	0.10	Beauty Bijoux
d0dba4aa-6fdf-4381-ba12-7e8a625f1d60	2025-04-08 12:00:00+02	Inv. 00625PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.894688+02	2025-10-07 10:40:35.894688+02	128.300	0.10	Beauty Bijoux
66254464-0ba3-46b3-a1ae-09a39d952e43	2025-04-08 12:00:00+02	Inv. 00725PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.895953+02	2025-10-07 10:40:35.895953+02	110.550	0.10	Beauty Bijoux
9d789eb5-a735-429b-9245-3dc88cea04a2	2025-04-08 12:00:00+02	Inv. 00825PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.897068+02	2025-10-07 10:40:35.897068+02	74.460	0.10	Beauty Bijoux
29c508d3-0239-4f80-a4a8-5e6b91bb4249	2025-04-08 12:00:00+02	Inv. 00925PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.89855+02	2025-10-07 10:40:35.89855+02	51.780	0.10	Beauty Bijoux
931184cb-994f-42c7-9749-4191220cc89f	2025-04-08 12:00:00+02	Inv. 01025PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.899989+02	2025-10-07 10:40:35.899989+02	56.310	0.10	Beauty Bijoux
c8c28907-0125-410b-917b-430a2a63aeef	2025-04-08 12:00:00+02	Inv. 01125PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.90154+02	2025-10-07 10:40:35.90154+02	52.610	0.10	Beauty Bijoux
dc0287bc-76ce-436f-8479-3c1b93e7e2df	2025-04-08 12:00:00+02	Inv. 01225PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.90599+02	2025-10-07 10:40:35.90599+02	61.470	0.10	Beauty Bijoux
e33c0848-91cb-4610-840d-c158ea541b1e	2025-04-08 12:00:00+02	Inv. 01325PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.907458+02	2025-10-07 10:40:35.907458+02	53.630	0.10	Beauty Bijoux
f46ed0ec-8c75-497f-b969-0a0e11f7ba80	2025-04-08 12:00:00+02	Inv. 01425PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.909337+02	2025-10-07 10:40:35.909337+02	155.520	0.10	Beauty Bijoux
3f2fd7ea-8653-4b80-8b31-615f39b72dd1	2025-04-08 12:00:00+02	Inv. 01525PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.911053+02	2025-10-07 10:40:35.911053+02	47.520	0.10	Beauty Bijoux
2807fc31-9e81-40c7-8e65-6e2155f173e2	2025-04-08 12:00:00+02	Inv. 01625PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.913946+02	2025-10-07 10:40:35.913946+02	48.810	0.10	Beauty Bijoux
1a65450e-093d-4d33-b135-31a18a49a39c	2025-04-08 12:00:00+02	Inv. 01725PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.915667+02	2025-10-07 10:40:35.915667+02	73.430	0.10	Beauty Bijoux
4ac5314f-af26-4b08-a006-4a292c95bd79	2025-04-08 12:00:00+02	Inv. 01825PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.918806+02	2025-10-07 10:40:35.918806+02	34.650	0.10	Beauty Bijoux
4d628956-a9a6-49e4-9754-11cdc3eec867	2025-04-08 12:00:00+02	Inv. 01925PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.921326+02	2025-10-07 10:40:35.921326+02	46.830	0.10	Beauty Bijoux
8a0e9d2e-b7bc-4832-b2ce-fa24e9f2dbda	2025-04-08 12:00:00+02	Inv. 02025PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.922925+02	2025-10-07 10:40:35.922925+02	40.730	0.10	Beauty Bijoux
a8ef5186-da08-415a-829e-e73722c9e609	2025-04-08 12:00:00+02	Inv. 02125PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.924312+02	2025-10-07 10:40:35.924312+02	63.950	0.10	Beauty Bijoux
ee392959-3805-4284-a685-e0cdab92fd53	2025-04-08 12:00:00+02	Inv. 02225PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.925817+02	2025-10-07 10:40:35.925817+02	45.380	0.10	Beauty Bijoux
533b36d0-548d-45d2-bfce-e50a2be7e2b3	2025-04-08 12:00:00+02	Inv. 02325PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.927469+02	2025-10-07 10:40:35.927469+02	44.150	0.10	Beauty Bijoux
04c18a4d-d1e6-4260-abed-4e44a99fe537	2025-04-08 12:00:00+02	Inv. 02425PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.929069+02	2025-10-07 10:40:35.929069+02	43.110	0.10	Beauty Bijoux
d3d5005f-e672-44dd-9f34-6ebeb3ed5765	2025-04-08 12:00:00+02	Inv. 02525PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.930852+02	2025-10-07 10:40:35.930852+02	22.460	0.10	Beauty Bijoux
0b85c006-7149-4a33-bb50-73d284382c0a	2025-04-08 12:00:00+02	Inv. 02625PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.933362+02	2025-10-07 10:40:35.933362+02	45.590	0.10	Beauty Bijoux
b2143a67-7b49-4625-a461-1a9b42b9cc73	2025-04-08 12:00:00+02	Inv. 02725PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.93532+02	2025-10-07 10:40:35.93532+02	27.080	0.10	Beauty Bijoux
4e1e4389-9d75-4fb1-a539-cff4fceeac22	2025-04-08 12:00:00+02	Inv. 02825PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.937099+02	2025-10-07 10:40:35.937099+02	40.020	0.10	Beauty Bijoux
9b67de73-b5e4-4b9b-a948-77d7d8adecde	2025-04-08 12:00:00+02	Inv. 02925PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.93862+02	2025-10-07 10:40:35.93862+02	32.600	0.10	Beauty Bijoux
e4764088-2047-4439-af9c-3a67b82edcbd	2025-04-08 12:00:00+02	Inv. 03025PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.939878+02	2025-10-07 10:40:35.939878+02	57.750	0.10	Beauty Bijoux
28e0b050-c32b-49c8-90f0-b45baef96ae3	2025-04-08 12:00:00+02	Inv. 03125PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.942292+02	2025-10-07 10:40:35.942292+02	95.910	0.10	Beauty Bijoux
22c9de10-b133-41fd-9bce-42e2ddbc16cd	2025-04-08 12:00:00+02	Inv. 03225PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.943324+02	2025-10-07 10:40:35.943324+02	80.030	0.10	Beauty Bijoux
3362a88c-a5ba-4a22-a41c-c10336db95b9	2025-04-08 12:00:00+02	Inv. 03325PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.944471+02	2025-10-07 10:40:35.944471+02	78.590	0.10	Beauty Bijoux
c9519f47-11c1-42cb-b0ab-2bc35fffebbf	2025-04-08 12:00:00+02	Inv. 03425PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.945678+02	2025-10-07 10:40:35.945678+02	88.680	0.10	Beauty Bijoux
901d989d-aed8-4d04-be0a-7082bb8af3e5	2025-04-08 12:00:00+02	Inv. 03525PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.946648+02	2025-10-07 10:40:35.946648+02	63.360	0.10	Beauty Bijoux
68e1e31d-1087-4e38-bea1-a70f410d2bc2	2025-04-08 12:00:00+02	Inv. 03625PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.947652+02	2025-10-07 10:40:35.947652+02	42.480	0.10	Beauty Bijoux
a132ce65-373c-441b-a274-742d6b5dfdcb	2025-04-08 12:00:00+02	Inv. 03725PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.948864+02	2025-10-07 10:40:35.948864+02	194.460	0.10	Beauty Bijoux
30c6fad9-4bf4-4c00-a24a-955c63e9cb4e	2025-04-08 12:00:00+02	Inv. 03825PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.9501+02	2025-10-07 10:40:35.9501+02	68.050	0.10	Beauty Bijoux
8accd519-4695-4841-973f-3881286a4c23	2025-04-08 12:00:00+02	Inv. 03925PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.95133+02	2025-10-07 10:40:35.95133+02	36.300	0.10	Beauty Bijoux
d22f0596-b915-4238-8a6b-4ce7f8c471ac	2025-04-08 12:00:00+02	Inv. 04025PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.952579+02	2025-10-07 10:40:35.952579+02	74.250	0.10	Beauty Bijoux
b30832a4-4a14-49aa-99e1-da2d15dcb83e	2025-04-08 12:00:00+02	Inv. 04125PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.954122+02	2025-10-07 10:40:35.954122+02	50.190	0.10	Beauty Bijoux
af6957c6-3611-4bb3-8936-bc0f34895987	2025-04-08 12:00:00+02	Inv. 04225PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.955379+02	2025-10-07 10:40:35.955379+02	83.400	0.10	Beauty Bijoux
dc4fff63-c4c2-458b-a6a5-e41803d9b3eb	2025-04-08 12:00:00+02	Inv. 04325PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.956637+02	2025-10-07 10:40:35.956637+02	150.970	0.10	Beauty Bijoux
0d673cb2-6974-4184-832a-0a524ef4c7cd	2025-04-08 12:00:00+02	Inv. 04425PH	Export to Poh Heng by Ferrari	0.000		Beauty Bijoux	2025-10-07 10:40:35.957824+02	2025-10-07 10:40:35.957824+02	53.490	0.10	Beauty Bijoux
f11705e0-cbad-41b6-8195-f489505a2892	2025-04-08 12:00:00+02	Inv. 103225	Received accessories from Germany	69.500		Beauty Bijoux	2025-10-07 10:40:35.959077+02	2025-10-07 10:40:35.959077+02	0.000	\N	Beauty Bijoux
896f53e0-fedf-42fb-a4ca-b85d47a54bb5	2025-04-08 12:00:00+02	Inv. 103225	Received gold sheet 375/- from Germany	80.440		Beauty Bijoux	2025-10-07 10:40:35.959984+02	2025-10-07 10:40:35.959984+02	0.000	\N	Beauty Bijoux
7d93c2d7-97b1-45c5-b8b0-25e9f518e71a	2025-04-08 12:00:00+02	Inv. 00524AU	Export to Sarah & Sebastian by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.961023+02	2025-10-07 10:40:35.961023+02	9.840	0.10	Beauty Bijoux
5fd511ad-27bd-41c8-9fa6-5838e4c235cf	2025-04-09 12:00:00+02	Delivery note 3007014	Shipped Samples Iconic to QI Services (Thailand) Ltd. (Bangkok)	10.960		Beauty Bijoux	2025-10-07 10:40:35.962127+02	2025-10-07 10:40:35.962127+02	0.000	\N	Beauty Bijoux
427de8b1-18a0-48d3-9de6-2637e5dc698f	2025-04-09 12:00:00+02	30117025/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.963002+02	2025-10-07 10:40:35.963002+02	2.670	0.00	Beauty Bijoux
e8fbcc4a-6adc-442b-8cb3-d8a05524711a	2025-04-09 12:00:00+02	30117026/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.963824+02	2025-10-07 10:40:35.963824+02	0.640	0.00	Beauty Bijoux
8c73452d-7e75-4b79-aace-f59be03d9694	2025-04-09 12:00:00+02	30117027/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.964622+02	2025-10-07 10:40:35.964622+02	0.790	0.00	Beauty Bijoux
47063d76-4016-424e-b06c-5f4a0c5142fe	2025-04-09 12:00:00+02	30117028/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.965731+02	2025-10-07 10:40:35.965731+02	0.120	0.00	Beauty Bijoux
c8a1af64-ecee-4e30-939e-b0c2166d74bc	2025-04-09 12:00:00+02	30117029/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:35.966868+02	2025-10-07 10:40:35.966868+02	0.280	0.00	Beauty Bijoux
e8e6abce-15ee-4afc-976a-b87fd1cd4b26	2025-04-09 12:00:00+02	Inv. 01825HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.968066+02	2025-10-07 10:40:35.968066+02	181.500	0.10	Beauty Bijoux
8d250ce4-a22e-4e5a-9cfb-a52ab6c6dbd9	2025-04-09 12:00:00+02	Inv. 01925HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.969234+02	2025-10-07 10:40:35.969234+02	11.550	0.10	Beauty Bijoux
d21fd413-5c18-42a4-8621-c54e7bb3a25a	2025-04-09 12:00:00+02	Inv. 02025HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.970623+02	2025-10-07 10:40:35.970623+02	90.750	0.10	Beauty Bijoux
c5fe42f8-0c22-4541-8e3e-cd7f843622b5	2025-04-09 12:00:00+02	Inv. 02125HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.972015+02	2025-10-07 10:40:35.972015+02	20.630	0.10	Beauty Bijoux
8f8cb4b7-a440-486c-be5f-fef584b8f20b	2025-04-10 12:00:00+02	Inv. 02225HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.973143+02	2025-10-07 10:40:35.973143+02	129.950	0.10	Beauty Bijoux
a07996a8-2249-4c17-8da0-a80603a1dd75	2025-04-10 12:00:00+02	Inv. 02325HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.974315+02	2025-10-07 10:40:35.974315+02	18.570	0.10	Beauty Bijoux
f5fa3709-f33c-4c66-b918-05344aa80984	2025-04-10 12:00:00+02	Inv. 02425HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.975582+02	2025-10-07 10:40:35.975582+02	45.300	0.10	Beauty Bijoux
e7e0b106-f708-4a7a-a005-b1de3aa08d53	2025-04-10 12:00:00+02	Inv. 02525HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.978008+02	2025-10-07 10:40:35.978008+02	72.600	0.10	Beauty Bijoux
aa8a9447-93c5-4806-bfab-ca6192091dbf	2025-04-11 12:00:00+02	Inv. 0142501	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.979129+02	2025-10-07 10:40:35.979129+02	1.510	\N	Beauty Bijoux
95a62d96-ed3f-4b88-9185-8f3beb4e6f35	2025-04-11 12:00:00+02	Inv. 0142501	Charged accessories 585/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.980405+02	2025-10-07 10:40:35.980405+02	3.340	\N	Beauty Bijoux
2a061901-00af-475d-bf26-ef67384741c1	2025-04-11 12:00:00+02	Inv. 0142501	Charged accessories 750/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.981609+02	2025-10-07 10:40:35.981609+02	2.500	\N	Beauty Bijoux
5697957f-2e6f-4d9f-a090-219f235b9fa3	2025-04-21 12:00:00+02	Inv. 103425	Received accessories from Germany	2.360		Beauty Bijoux	2025-10-07 10:40:35.982709+02	2025-10-07 10:40:35.982709+02	0.000	\N	Beauty Bijoux
07812bc3-5288-4512-8613-da7c55e73aeb	2025-04-24 12:00:00+02	Inv. 02625HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.983824+02	2025-10-07 10:40:35.983824+02	178.600	0.10	Beauty Bijoux
d0be8ae9-5b48-45af-83b0-081d001385f8	2025-04-24 12:00:00+02	Inv. 02725HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.986763+02	2025-10-07 10:40:35.986763+02	75.480	0.10	Beauty Bijoux
cf5cef0b-d613-44e8-a07c-0ac6a3922bc6	2025-04-25 12:00:00+02	Inv. 02825HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:35.988215+02	2025-10-07 10:40:35.988215+02	123.750	0.10	Beauty Bijoux
eda4a2ff-b856-4af5-80ce-bf1158b12b3a	2025-04-25 12:00:00+02	Inv. 0152502	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.989398+02	2025-10-07 10:40:35.989398+02	0.530	\N	Beauty Bijoux
a6509be8-e376-4e4e-89e0-cef9ee82b56e	2025-04-26 12:00:00+02	Inv. 0152503	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.99038+02	2025-10-07 10:40:35.99038+02	13.240	\N	Beauty Bijoux
10086b0d-d853-41cd-8972-96330bc84d95	2025-04-26 12:00:00+02	Inv. 0152503	Charged accessories 585/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:35.991515+02	2025-10-07 10:40:35.991515+02	0.450	\N	Beauty Bijoux
1929b791-cca2-44b8-bc1d-5a9e5705ec7d	2025-04-28 12:00:00+02	IV2504-038	Purchased K18WGPd10 230SDC4 from Nakagawa	13.680		Beauty Bijoux	2025-10-07 10:40:35.992581+02	2025-10-07 10:40:35.992581+02	0.000	\N	Beauty Bijoux
fb8f2c06-3e77-4285-870e-3bc5270af6e6	2025-04-28 12:00:00+02	IV2504-039	Purchased K18WGPD5 Lobster 10mm "P+750" NFRP from Nakagawa	13.150		Beauty Bijoux	2025-10-07 10:40:35.993691+02	2025-10-07 10:40:35.993691+02	0.000	\N	Beauty Bijoux
06d7f852-7b8d-4f55-9bf1-3663f59773d4	2025-04-28 12:00:00+02	IV2504-039	Purchased K18 Lavalier Crown with Silicone "Paspaley" from Nakagawa	15.300		Beauty Bijoux	2025-10-07 10:40:35.994803+02	2025-10-07 10:40:35.994803+02	0.000	\N	Beauty Bijoux
509b1573-9c07-43bb-ad85-ea296b649822	2025-04-28 12:00:00+02	IV2504-039	Purchased K18WGPD1.25 Lavalier Crown with Silicone "Paspaley" NFRP from Nakagawa	18.250		Beauty Bijoux	2025-10-07 10:40:35.996133+02	2025-10-07 10:40:35.996133+02	0.000	\N	Beauty Bijoux
a4ba404e-e8b2-402d-aa2c-2d0058edcc40	2025-04-28 12:00:00+02	IV2504-040	Purchased K18YG 230SDC4 from Nakagawa	245.640		Beauty Bijoux	2025-10-07 10:40:35.99742+02	2025-10-07 10:40:35.99742+02	0.000	\N	Beauty Bijoux
061626b0-1a44-449b-ba63-76cb925dff42	2025-04-28 12:00:00+02	IV2504-040	Purchased K18WGPd10 230SDC4 from Nakagawa	82.350		Beauty Bijoux	2025-10-07 10:40:35.998541+02	2025-10-07 10:40:35.998541+02	0.000	\N	Beauty Bijoux
cfd43712-46f2-4369-a408-57d0f66176f6	2025-04-28 12:00:00+02	IV2504-040	Purchased K18 Lobster 10mm "P+750" from Nakagawa	31.550		Beauty Bijoux	2025-10-07 10:40:35.999467+02	2025-10-07 10:40:35.999467+02	0.000	\N	Beauty Bijoux
127f912a-351c-40a4-be86-cd206277afa5	2025-04-28 12:00:00+02	IV2504-040	Purchased K18WGPD5 Lobster 10mm "P+750" NFRP from Nakagawa	13.080		Beauty Bijoux	2025-10-07 10:40:36.00051+02	2025-10-07 10:40:36.00051+02	0.000	\N	Beauty Bijoux
f3ca951b-bec0-4284-bf40-fb59a1f94190	2025-04-28 12:00:00+02	IV2504-040	Purchased K18YG LS4mm Slide Bead with PNK-15(V) from Nakagawa	14.960		Beauty Bijoux	2025-10-07 10:40:36.001406+02	2025-10-07 10:40:36.001406+02	0.000	\N	Beauty Bijoux
b0c7db51-69d1-499a-b4bc-da8536f380eb	2025-04-28 12:00:00+02	IV2504-040	Purchased K18 Lavalier Crown with Silicone "Paspaley" from Nakagawa	35.700		Beauty Bijoux	2025-10-07 10:40:36.002498+02	2025-10-07 10:40:36.002498+02	0.000	\N	Beauty Bijoux
10b6a333-6518-4280-8362-3d8d13d74def	2025-04-28 12:00:00+02	IV2504-040	Purchased K18WGPD1.25 Lavalier Crown with Silicone "Paspaley" NFRP from Nakagawa	18.250		Beauty Bijoux	2025-10-07 10:40:36.003662+02	2025-10-07 10:40:36.003662+02	0.000	\N	Beauty Bijoux
bdc60aea-aea0-4e53-a7a8-c5566d937d97	2025-04-29 12:00:00+02	Inv. 103625	Received accessories from Germany	19.040		Beauty Bijoux	2025-10-07 10:40:36.005071+02	2025-10-07 10:40:36.005071+02	0.000	\N	Beauty Bijoux
abe5990a-957d-488a-9a59-9d10818e4873	2025-04-30 12:00:00+02	Inv. 04125PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.006099+02	2025-10-07 10:40:36.006099+02	20.060	0.10	Beauty Bijoux
ffe4c34a-0692-4d34-9bf3-c4ab4d25f19c	2025-04-30 12:00:00+02	Inv. 02925HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.007478+02	2025-10-07 10:40:36.007478+02	176.970	0.10	Beauty Bijoux
8c0f4c73-a82c-4e0a-ac93-7c7ab5c4d574	2025-04-30 12:00:00+02	Inv. 03025HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.008634+02	2025-10-07 10:40:36.008634+02	71.780	0.10	Beauty Bijoux
705b95ce-6d6b-4a86-9b67-255b3cfcf5a8	2025-05-02 12:00:00+02	Inv. 03125HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.009731+02	2025-10-07 10:40:36.009731+02	89.100	0.10	Beauty Bijoux
c36d0ec1-dc6c-42f1-b69c-a9a27867f366	2025-05-02 12:00:00+02	Inv. 03225HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.010637+02	2025-10-07 10:40:36.010637+02	90.750	0.10	Beauty Bijoux
0eb6ba1a-9796-45f2-b61d-8bed6c540be7	2025-05-02 12:00:00+02	30118145/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.011424+02	2025-10-07 10:40:36.011424+02	2.850	0.00	Beauty Bijoux
dde12202-ace2-4f77-aca2-3816b59eed47	2025-05-02 12:00:00+02	30118146/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.012211+02	2025-10-07 10:40:36.012211+02	26.500	0.00	Beauty Bijoux
3951a134-9c48-4664-a2d4-9d56f5ba324c	2025-05-02 12:00:00+02	30118147/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.012999+02	2025-10-07 10:40:36.012999+02	8.690	0.00	Beauty Bijoux
89029619-0cff-41f0-aabf-c1277e89d423	2025-05-02 12:00:00+02	30118148/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.013848+02	2025-10-07 10:40:36.013848+02	3.710	0.00	Beauty Bijoux
f41af71e-4d78-4595-8649-d168a4deaf5c	2025-05-03 12:00:00+02	Inv. 0162501	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.014734+02	2025-10-07 10:40:36.014734+02	15.980	\N	Beauty Bijoux
18a078a0-615e-4ee7-9005-eab1ef559d85	2025-05-03 12:00:00+02	Inv. 0162501	Charged accessories 333/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.015514+02	2025-10-07 10:40:36.015514+02	1.160	\N	Beauty Bijoux
9a64ccc0-ac2d-4fbf-b95d-2dfa7113c3b2	2025-05-03 12:00:00+02	Inv. 0162501	Charged accessories 750/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.016236+02	2025-10-07 10:40:36.016236+02	0.970	\N	Beauty Bijoux
cfedbca0-9325-4e31-a1be-b7e2e559563c	2025-05-03 12:00:00+02	Inv. 103825	Received accessories from Germany	6.710		Beauty Bijoux	2025-10-07 10:40:36.016919+02	2025-10-07 10:40:36.016919+02	0.000	\N	Beauty Bijoux
499ce1f7-459c-4623-a090-31c357a68f45	2025-05-07 12:00:00+02	IV2505-008	Purchased K18WGPd5 LS4mm Slide Bead with PNK-15(V) from Nakagawa	6.930		Beauty Bijoux	2025-10-07 10:40:36.019258+02	2025-10-07 10:40:36.019258+02	0.000	\N	Beauty Bijoux
f635a9e9-f69b-4f63-937c-a2e3a4cabf44	2025-05-07 12:00:00+02	IV2505-008	Purchased K18 Lavalier Crown with Silicone "Paspaley" from Nakagawa	7.650		Beauty Bijoux	2025-10-07 10:40:36.020523+02	2025-10-07 10:40:36.020523+02	0.000	\N	Beauty Bijoux
4de344ea-2248-4779-9ad2-b3866138b937	2025-05-08 12:00:00+02	Proforma 20250116JWD	Received ring 18K for repair  from Paspaley	8.500		Beauty Bijoux	2025-10-07 10:40:36.021827+02	2025-10-07 10:40:36.021827+02	0.000	\N	Beauty Bijoux
bc2e9ef9-e934-4e80-ac9d-fd168c008cfe	2025-05-08 12:00:00+02	HCR2500007_HFI2500250	Received Return Consignments Cherish ring 22K from Poh Heng	25.940		Beauty Bijoux	2025-10-07 10:40:36.022702+02	2025-10-07 10:40:36.022702+02	0.000	\N	Beauty Bijoux
8ccbcc61-a712-4131-87c1-ebec8b692314	2025-05-08 12:00:00+02	HCR2500008_HFI2400301	Received Return Consignments Cherish ring 22K from Poh Heng	6.410		Beauty Bijoux	2025-10-07 10:40:36.023577+02	2025-10-07 10:40:36.023577+02	0.000	\N	Beauty Bijoux
afdde12d-3f94-405f-94b8-6cbd936f34b4	2025-05-08 12:00:00+02	HCR2500009_HFI2500252	Received Return Consignments Cherish ring 22K from Poh Heng	20.120		Beauty Bijoux	2025-10-07 10:40:36.024476+02	2025-10-07 10:40:36.024476+02	0.000	\N	Beauty Bijoux
cd917863-ebe0-4941-89fa-4185f3a1513d	2025-05-08 12:00:00+02	HCR2500010_HFI2500251	Received Return Consignments Cherish ring 22K from Poh Heng	8.760		Beauty Bijoux	2025-10-07 10:40:36.025368+02	2025-10-07 10:40:36.025368+02	0.000	\N	Beauty Bijoux
1d3681b7-73fb-4f0f-82f8-46e19dc30126	2025-05-08 12:00:00+02	HCR2500011_HFI2400192	Received Return Consignments Cherish ring 22K from Poh Heng (Credit note 00225CN)	39.670		Beauty Bijoux	2025-10-07 10:40:36.026368+02	2025-10-07 10:40:36.026368+02	0.000	\N	Beauty Bijoux
1988f847-ce4e-48ea-924d-cba539102ad6	2025-05-08 12:00:00+02	IV2505-016	Purchased K18WGPd10 230SDC4 from Nakagawa	51.710		Beauty Bijoux	2025-10-07 10:40:36.027201+02	2025-10-07 10:40:36.027201+02	0.000	\N	Beauty Bijoux
6093357e-5581-4613-8872-52b46d5a109b	2025-05-13 12:00:00+02	Inv. 104125	Received accessories from Germany	11.590		Beauty Bijoux	2025-10-07 10:40:36.02806+02	2025-10-07 10:40:36.02806+02	0.000	\N	Beauty Bijoux
4ea8832f-a218-41ac-af4e-bc6b3c9588c4	2025-05-13 12:00:00+02	Credit note 00125CN	The weight difference from invoice 00725PH (Poh Heng)	4.130		Beauty Bijoux	2025-10-07 10:40:36.02893+02	2025-10-07 10:40:36.02893+02	0.000	\N	Beauty Bijoux
82d3a940-fc74-4b96-b019-c6c1a38a5eed	2025-05-13 12:00:00+02	Proforma 20250905JWD	Received chain 18K for production from Paspaley	1.600		Beauty Bijoux	2025-10-07 10:40:36.030831+02	2025-10-07 10:40:36.030831+02	0.000	\N	Beauty Bijoux
87f66270-b04d-4b2b-a4f1-9a37aebc64e1	2025-05-13 12:00:00+02	30119030/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.031914+02	2025-10-07 10:40:36.031914+02	2.630	0.00	Beauty Bijoux
7e8adb34-399f-438d-b820-19044d49668e	2025-05-13 12:00:00+02	30119031/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.032895+02	2025-10-07 10:40:36.032895+02	0.560	0.00	Beauty Bijoux
28262fbd-802a-41f5-aa98-0eba85c41282	2025-05-13 12:00:00+02	30119032/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.033841+02	2025-10-07 10:40:36.033841+02	0.770	0.00	Beauty Bijoux
38ae3684-6a82-4ce6-9dfa-29ae97f12a74	2025-05-13 12:00:00+02	30119033/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.034649+02	2025-10-07 10:40:36.034649+02	0.130	0.00	Beauty Bijoux
903360d5-c6e4-4005-9185-578fdfc84453	2025-05-13 12:00:00+02	30119034/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.035398+02	2025-10-07 10:40:36.035398+02	0.300	0.00	Beauty Bijoux
3b9e7240-0584-4375-8bbd-e82c61b9dba8	2025-05-14 12:00:00+02	Inv. 25002662	Purchased fine gold from Umicore	2000.000		Beauty Bijoux	2025-10-07 10:40:36.036459+02	2025-10-07 10:40:36.036459+02	0.000	\N	Beauty Bijoux
befa2305-8cba-463f-a078-2799df20fb01	2025-05-10 12:00:00+02	Inv. 0172501	Charged accessories 585/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.037625+02	2025-10-07 10:40:36.037625+02	0.190	\N	Beauty Bijoux
fcc61f77-725e-4922-961e-5fba649f4bce	2025-05-15 12:00:00+02	Inv. 04225PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.038578+02	2025-10-07 10:40:36.038578+02	245.450	0.10	Beauty Bijoux
45639b92-21e3-4271-823b-53a4ac63fc5d	2025-05-15 12:00:00+02	Inv. 04325PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.03935+02	2025-10-07 10:40:36.03935+02	67.490	0.10	Beauty Bijoux
288fdd15-6d98-4cc9-896f-32d48a102705	2025-05-16 12:00:00+02	Inv. 04425PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.040122+02	2025-10-07 10:40:36.040122+02	464.520	0.10	Beauty Bijoux
09b38ff0-ba33-40c5-bf6c-efaea619b04f	2025-05-16 12:00:00+02	Inv. 04525PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.04087+02	2025-10-07 10:40:36.04087+02	6.080	0.10	Beauty Bijoux
dc01fe97-0b77-4735-ad88-f7aba02ebe1d	2025-05-17 12:00:00+02	Inv. 0182501	Charged accessories 333/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.041664+02	2025-10-07 10:40:36.041664+02	2.030	\N	Beauty Bijoux
bcab17e7-331d-4e2f-a81d-de8dbef60e58	2025-05-17 12:00:00+02	Inv. 0182501	Charged accessories 585/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.042677+02	2025-10-07 10:40:36.042677+02	9.090	\N	Beauty Bijoux
8c42a7af-d6e6-42d2-81be-b93ae6b6536e	2025-05-17 12:00:00+02	Inv. 0182501	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.043629+02	2025-10-07 10:40:36.043629+02	0.510	\N	Beauty Bijoux
98d2751d-4b52-4cb1-987e-5877aa4379f3	2025-05-19 12:00:00+02	Inv. 03325HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.044678+02	2025-10-07 10:40:36.044678+02	61.880	0.10	Beauty Bijoux
0462853e-818c-4b7b-85c5-9f8bf1ff0a38	2025-05-19 12:00:00+02	Inv. 03425HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.045601+02	2025-10-07 10:40:36.045601+02	65.180	0.10	Beauty Bijoux
ae311f8b-4dd6-40ed-893d-2e5a7fa09744	2025-05-19 12:00:00+02	Inv. 03525HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.046628+02	2025-10-07 10:40:36.046628+02	135.300	0.10	Beauty Bijoux
85b1bbff-eef4-42cc-99e2-19f6fc9fe838	2025-05-20 12:00:00+02	Inv. 03625HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.047688+02	2025-10-07 10:40:36.047688+02	66.420	0.10	Beauty Bijoux
c209e13d-61cf-4dd4-a367-23b09ae16755	2025-05-20 12:00:00+02	Inv. 03725HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.048787+02	2025-10-07 10:40:36.048787+02	119.630	0.10	Beauty Bijoux
ef955b97-9cab-402d-a179-8f5a0397d0fe	2025-05-20 12:00:00+02	Inv. 03825HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.04962+02	2025-10-07 10:40:36.04962+02	75.500	0.10	Beauty Bijoux
eb6de63a-2690-46b3-867d-3f3ddf3cd103	2025-05-20 12:00:00+02	Inv. 104325	Received accessories from Germany	4.930		Beauty Bijoux	2025-10-07 10:40:36.050445+02	2025-10-07 10:40:36.050445+02	0.000	\N	Beauty Bijoux
67628d49-cb93-4474-9659-e57fdf07b1c7	2025-05-21 12:00:00+02	Inv. 04625PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.051381+02	2025-10-07 10:40:36.051381+02	103.360	0.10	Beauty Bijoux
adf2b2ce-b5af-4282-b80d-a3a911584f35	2025-05-21 12:00:00+02	Inv. 04725PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.052401+02	2025-10-07 10:40:36.052401+02	33.300	0.10	Beauty Bijoux
55d5be08-0b5b-4dca-8929-ab4a6860489c	2025-05-22 12:00:00+02	Inv. 04825PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.05393+02	2025-10-07 10:40:36.05393+02	148.500	0.10	Beauty Bijoux
d539c155-dc3b-45f8-a501-431e140ffe45	2025-05-23 12:00:00+02	Inv. 0192501	Charged accessories 333/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.054984+02	2025-10-07 10:40:36.054984+02	2.420	\N	Beauty Bijoux
36a4c1ea-80e0-4524-9dcb-fb7b8d192e16	2025-05-23 12:00:00+02	Inv. 0192501	Charged accessories 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.055806+02	2025-10-07 10:40:36.055806+02	0.120	\N	Beauty Bijoux
ee3e6585-486a-4d7f-8647-93399151156a	2025-05-23 12:00:00+02	Inv. 0192501	Charged accessories 585/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.056548+02	2025-10-07 10:40:36.056548+02	18.170	\N	Beauty Bijoux
dbc94bea-2f4c-4287-b18e-516305e0266f	2025-05-23 12:00:00+02	Inv. 0192501	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.057363+02	2025-10-07 10:40:36.057363+02	1.510	\N	Beauty Bijoux
82890b2b-702c-4b28-be4c-f4206937774a	2025-05-26 12:00:00+02	Proforma 20250516JWD	Received chain 18K for samples from Paspaley	1.320		Beauty Bijoux	2025-10-07 10:40:36.059264+02	2025-10-07 10:40:36.059264+02	0.000	\N	Beauty Bijoux
a760274e-3822-4c49-997e-fd57c921be77	2025-05-26 12:00:00+02	Delivery note 3007015	Shipped Samples order reg. quotation 1119217 to QI Services (Thailand) Ltd. (Bangkok)	2.730		Beauty Bijoux	2025-10-07 10:40:36.060145+02	2025-10-07 10:40:36.060145+02	0.000	\N	Beauty Bijoux
62084080-af71-4ae1-9154-706f1e6178dd	2025-05-27 12:00:00+02	Inv. 104525	Received accessories from Germany	26.430		Beauty Bijoux	2025-10-07 10:40:36.061194+02	2025-10-07 10:40:36.061194+02	0.000	\N	Beauty Bijoux
13ddaf3a-d455-4a71-a48c-5304f02ef44d	2025-05-27 12:00:00+02	30120005/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.062169+02	2025-10-07 10:40:36.062169+02	25.600	0.00	Beauty Bijoux
ae72d1e9-cc67-4da3-8caa-1c40fcbd6bdd	2025-05-27 12:00:00+02	30120006/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.063292+02	2025-10-07 10:40:36.063292+02	8.820	0.00	Beauty Bijoux
fae54a1e-81e4-42cd-8fc3-36aa4d194e86	2025-05-27 12:00:00+02	30120008/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.064378+02	2025-10-07 10:40:36.064378+02	3.220	0.00	Beauty Bijoux
e01dc6bc-13c7-4f31-9898-fcbe859f5765	2025-05-29 12:00:00+02	Inv. 00525ART	Export to Artistry by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.065309+02	2025-10-07 10:40:36.065309+02	29.510	0.10	Beauty Bijoux
048b1940-ea20-4720-8e9b-37e977987661	2025-05-29 12:00:00+02	Inv. 104625	Received accessories from Germany	0.620		Beauty Bijoux	2025-10-07 10:40:36.066193+02	2025-10-07 10:40:36.066193+02	0.000	\N	Beauty Bijoux
c7cdf0be-489f-4fcd-bc95-03d8a18b80f2	2025-05-31 12:00:00+02	Inv. 0202501	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.067059+02	2025-10-07 10:40:36.067059+02	2.820	\N	Beauty Bijoux
6b4a4224-ef43-49b8-bb7d-8a755550cc5f	2025-05-31 12:00:00+02	Inv. 0202501	Charged accessories 585/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.06804+02	2025-10-07 10:40:36.06804+02	0.760	\N	Beauty Bijoux
4843963c-8baf-4339-917c-942292505d87	2025-05-31 12:00:00+02	Inv. 0202501	Charged accessories 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.069071+02	2025-10-07 10:40:36.069071+02	2.460	\N	Beauty Bijoux
62e3bb7a-683c-48ab-84b9-66f8d0070225	2025-06-05 12:00:00+02	Proforma 20250529JWD	Received ring 18K for remake from Paspaley (Inv. 02325PPY)	6.600		Beauty Bijoux	2025-10-07 10:40:36.071496+02	2025-10-07 10:40:36.071496+02	0.000	\N	Beauty Bijoux
a7691d4c-7a2e-49a7-a9c8-b2120b07f064	2025-06-05 12:00:00+02	Inv. 05025PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.072457+02	2025-10-07 10:40:36.072457+02	2.080	0.10	Beauty Bijoux
c2bc0d66-31bd-475b-83b0-a0b3d3a1a7e8	2025-06-05 12:00:00+02	Inv. 05125PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.073417+02	2025-10-07 10:40:36.073417+02	8.380	0.10	Beauty Bijoux
245ad393-a4f0-4f03-be11-28558373fb8b	2025-06-05 12:00:00+02	Inv. 05225PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.074358+02	2025-10-07 10:40:36.074358+02	9.150	0.10	Beauty Bijoux
8d753f23-b2dd-4cbf-b60a-5e4c0ec0c017	2025-06-05 12:00:00+02	Inv. 05325PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.075251+02	2025-10-07 10:40:36.075251+02	20.370	0.10	Beauty Bijoux
6f133476-2c0b-4de7-9109-46c8fcc3ded2	2025-06-05 12:00:00+02	Proforma inv. 05/06-2025	Export to Paspaley by DHL (Return customer's samples)	82.800		Beauty Bijoux	2025-10-07 10:40:36.076465+02	2025-10-07 10:40:36.076465+02	0.000	\N	Beauty Bijoux
fd1afb44-1c48-4b41-8ecd-bffbb479d2ad	2025-06-05 12:00:00+02	Inv. 03925HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.077349+02	2025-10-07 10:40:36.077349+02	202.130	0.10	Beauty Bijoux
14e04d34-8545-4dea-ab65-3d8ff10817b0	2025-06-05 12:00:00+02	Inv. 04025HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.078084+02	2025-10-07 10:40:36.078084+02	127.050	0.10	Beauty Bijoux
504d73a9-67c0-4a5d-8136-4ceaae9e5cad	2025-06-06 12:00:00+02	Inv. 04125HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.079708+02	2025-10-07 10:40:36.079708+02	54.450	0.10	Beauty Bijoux
98b781f4-ca64-4379-bde0-fa8d94dcb586	2025-06-06 12:00:00+02	Inv. 04225HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.080647+02	2025-10-07 10:40:36.080647+02	128.700	0.10	Beauty Bijoux
df2c48d9-77c3-45f1-add8-6a9ac8d5e35f	2025-06-06 12:00:00+02	Inv. 04325HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.081609+02	2025-10-07 10:40:36.081609+02	64.350	0.10	Beauty Bijoux
90203ff7-d11d-49fa-9519-ec22f18baa3b	2025-06-07 12:00:00+02	Inv. 0212501	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.082584+02	2025-10-07 10:40:36.082584+02	1.050	\N	Beauty Bijoux
f6e64179-3fc4-4585-a76b-913f534af54e	2025-06-09 12:00:00+02	Inv. 04425HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.083563+02	2025-10-07 10:40:36.083563+02	14.850	0.10	Beauty Bijoux
5d20a5ba-c386-47ea-8594-39207697fa4f	2025-06-10 12:00:00+02	HRN2500088_HFI2500451	Received return for repair 18K from Poh Heng (00225PH)	78.460		Beauty Bijoux	2025-10-07 10:40:36.084639+02	2025-10-07 10:40:36.084639+02	0.000	\N	Beauty Bijoux
3058ea01-f3c7-4aac-bc3d-5561bdbf7691	2025-06-10 12:00:00+02	HRN2500090_HFI2500464	Received return for repair 18K from Poh Heng (02125PH)	2.150		Beauty Bijoux	2025-10-07 10:40:36.08571+02	2025-10-07 10:40:36.08571+02	0.000	\N	Beauty Bijoux
c8eb2cc4-4e5f-449c-9e12-232038ff3f25	2025-06-10 12:00:00+02	HRN2500091_HFI2500453	Received return for repair 18K from Poh Heng (02925PH)	18.930		Beauty Bijoux	2025-10-07 10:40:36.087011+02	2025-10-07 10:40:36.087011+02	0.000	\N	Beauty Bijoux
11598233-4baf-4761-8162-3ff514fd1422	2025-06-10 12:00:00+02	HRN2500093_HFI2500465	Received return for repair 18K from Poh Heng (02225PH)	3.730		Beauty Bijoux	2025-10-07 10:40:36.088322+02	2025-10-07 10:40:36.088322+02	0.000	\N	Beauty Bijoux
ba492cf0-315c-42ad-9b23-8df6143689b7	2025-06-10 12:00:00+02	HRN2500094_HFI2500450	Received return for repair 18K from Poh Heng (02425PH)	1.720		Beauty Bijoux	2025-10-07 10:40:36.08937+02	2025-10-07 10:40:36.08937+02	0.000	\N	Beauty Bijoux
5e1ee062-a004-4a7b-9727-402fba40a35b	2025-06-10 12:00:00+02	HRN2500095_HFI2500466	Received return for repair 18K from Poh Heng (03925PH)	4.290		Beauty Bijoux	2025-10-07 10:40:36.090611+02	2025-10-07 10:40:36.090611+02	0.000	\N	Beauty Bijoux
7a6afe50-61ae-4f88-85fb-a3743265bb6d	2025-06-10 12:00:00+02	HRN2500096_HFI2500455	Received return for repair 18K from Poh Heng (02325PH)	1.300		Beauty Bijoux	2025-10-07 10:40:36.09179+02	2025-10-07 10:40:36.09179+02	0.000	\N	Beauty Bijoux
4cd90ddd-762e-48e9-b207-17cebb6af9ea	2025-06-10 12:00:00+02	HRN2500097_HFI2500399	Received return for repair 18K from Poh Heng (03125PH)	3.830		Beauty Bijoux	2025-10-07 10:40:36.092708+02	2025-10-07 10:40:36.092708+02	0.000	\N	Beauty Bijoux
a83689b1-66fc-4572-aa7b-c14cdc15fcf7	2025-06-10 12:00:00+02	HRN2500098_HFI2500408	Received return for repair 18K from Poh Heng (02725PH)	3.350		Beauty Bijoux	2025-10-07 10:40:36.093614+02	2025-10-07 10:40:36.093614+02	0.000	\N	Beauty Bijoux
5bbe73e5-23e5-4fc4-92d1-cdc8e5afe67c	2025-06-10 12:00:00+02	HRN2500099_HFI2500407	Received return for repair 18K from Poh Heng (01225PH)	4.190		Beauty Bijoux	2025-10-07 10:40:36.094476+02	2025-10-07 10:40:36.094476+02	0.000	\N	Beauty Bijoux
80688d4b-e93d-4ddd-9e89-678593eec282	2025-06-10 12:00:00+02	HRN2500100_HFI2500398	Received return for repair 18K from Poh Heng (01125PH)	4.310		Beauty Bijoux	2025-10-07 10:40:36.095346+02	2025-10-07 10:40:36.095346+02	0.000	\N	Beauty Bijoux
26a2c557-8be9-4ca5-ae20-70cbc158bdc9	2025-06-10 12:00:00+02	HRN2500107_HFI2500453	Received return for repair 18K from Poh Heng (02925PH)	3.910		Beauty Bijoux	2025-10-07 10:40:36.096306+02	2025-10-07 10:40:36.096306+02	0.000	\N	Beauty Bijoux
c008e117-1c50-4214-a7d3-f5babcda680f	2025-06-10 12:00:00+02	HRN2500108_HFI2500440	Received return for repair 18K from Poh Heng (04025PH)	26.930		Beauty Bijoux	2025-10-07 10:40:36.097266+02	2025-10-07 10:40:36.097266+02	0.000	\N	Beauty Bijoux
38541946-9f53-4a23-8f45-e2f29a7dc597	2025-06-10 12:00:00+02	Repair_HPO2500908	Received return for repair 18K from Poh Heng	5.560		Beauty Bijoux	2025-10-07 10:40:36.098163+02	2025-10-07 10:40:36.098163+02	0.000	\N	Beauty Bijoux
5aa202f0-5738-4a5e-ace4-cdfa9f198dff	2025-06-10 12:00:00+02	HRN2500080_HFI2500400	Received return for repair 18K from Poh Heng (04125PH)	50.200		Beauty Bijoux	2025-10-07 10:40:36.099048+02	2025-10-07 10:40:36.099048+02	0.000	\N	Beauty Bijoux
b5beeab1-006b-4c0c-83bf-180c3e431933	2025-06-10 12:00:00+02	HRN2500081_HFI2500432	Received return for repair 18K from Poh Heng (03225PH)	3.200		Beauty Bijoux	2025-10-07 10:40:36.100077+02	2025-10-07 10:40:36.100077+02	0.000	\N	Beauty Bijoux
025749e6-ee19-43fd-9fb2-efe3c03065a1	2025-06-10 12:00:00+02	HRN2500082_HFI2500461	Received return for repair 18K from Poh Heng (02625PH)	0.830		Beauty Bijoux	2025-10-07 10:40:36.100881+02	2025-10-07 10:40:36.100881+02	0.000	\N	Beauty Bijoux
b4ec445f-abad-4950-9dc7-c813c6b4285a	2025-06-10 12:00:00+02	HRN2500083_HFI2500448	Received return for repair 18K from Poh Heng (01325PH)	12.750		Beauty Bijoux	2025-10-07 10:40:36.101732+02	2025-10-07 10:40:36.101732+02	0.000	\N	Beauty Bijoux
b416be39-ed84-4aab-8474-259653f20478	2025-06-10 12:00:00+02	HRN2500084_HFI2500449	Received return for repair 18K from Poh Heng (01425PH)	102.050		Beauty Bijoux	2025-10-07 10:40:36.102597+02	2025-10-07 10:40:36.102597+02	0.000	\N	Beauty Bijoux
524b857b-58fa-47ea-a464-96b1224bf17a	2025-06-10 12:00:00+02	HRN2500085_HFI2500462	Received return for repair 18K from Poh Heng (01625PH)	9.780		Beauty Bijoux	2025-10-07 10:40:36.103573+02	2025-10-07 10:40:36.103573+02	0.000	\N	Beauty Bijoux
0d03b94d-f42b-478d-a056-8a171baf3201	2025-06-10 12:00:00+02	HRN2500086_HFI2500463	Received return for repair 18K from Poh Heng (03625PH)	4.520		Beauty Bijoux	2025-10-07 10:40:36.104659+02	2025-10-07 10:40:36.104659+02	0.000	\N	Beauty Bijoux
ab0e2eeb-2bb9-4504-866b-45abb99ffa0c	2025-06-10 12:00:00+02	HRN2500087_HFI2500439	Received return for repair 18K from Poh Heng (01025PH)	4.330		Beauty Bijoux	2025-10-07 10:40:36.105658+02	2025-10-07 10:40:36.105658+02	0.000	\N	Beauty Bijoux
b1432c10-aaac-43f2-8509-b1dcdfb3e61b	2025-06-10 12:00:00+02	HRN2500089_HFI2500438	Received return for repair 18K from Poh Heng (00425PH)	27.110		Beauty Bijoux	2025-10-07 10:40:36.106489+02	2025-10-07 10:40:36.106489+02	0.000	\N	Beauty Bijoux
3df8c978-35b8-415d-ae37-d77ed59c235f	2025-06-10 12:00:00+02	HRN2500092_HFI2500447	Received return for repair 18K from Poh Heng (02025PH)	1.660		Beauty Bijoux	2025-10-07 10:40:36.108168+02	2025-10-07 10:40:36.108168+02	0.000	\N	Beauty Bijoux
a81696e7-3358-4316-b166-613a4113d7b7	2025-06-11 12:00:00+02	Delivery note 3007015	Received the returned samples order reg. quotation 1119217 from QI Services (Thailand) Ltd. (Bangkok)	1.540		Beauty Bijoux	2025-10-07 10:40:36.109259+02	2025-10-07 10:40:36.109259+02	0.000	\N	Beauty Bijoux
11c3305e-ec89-4d89-9f77-9fc97f917a48	2025-06-11 12:00:00+02	Inv. 68-2024	Purchased Soldet for Yellow Gold (18 kt) from NOBLE MIND	75.970		Beauty Bijoux	2025-10-07 10:40:36.110149+02	2025-10-07 10:40:36.110149+02	0.000	\N	Beauty Bijoux
681096d6-5777-41fb-9adc-5b4ca4362c05	2025-06-11 12:00:00+02	30120807/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.111383+02	2025-10-07 10:40:36.111383+02	1.850	0.00	Beauty Bijoux
e736b5c4-fc08-4d9d-bc1f-9aed773f60b6	2025-06-11 12:00:00+02	30120809/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.112315+02	2025-10-07 10:40:36.112315+02	0.340	0.00	Beauty Bijoux
ee5dad35-265c-4292-b9d1-07dc3a234ab9	2025-06-11 12:00:00+02	30120812/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.113365+02	2025-10-07 10:40:36.113365+02	0.530	0.00	Beauty Bijoux
76223c8c-aeeb-4cd0-b8ae-7f6020065cfd	2025-06-11 12:00:00+02	30120813/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.114312+02	2025-10-07 10:40:36.114312+02	0.100	0.00	Beauty Bijoux
076bffbb-a88a-438c-808e-a60e3c59b3a4	2025-06-11 12:00:00+02	30120814/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.115211+02	2025-10-07 10:40:36.115211+02	0.240	0.00	Beauty Bijoux
08d8f149-68f6-4340-9df4-ca1ce187c76f	2025-06-11 12:00:00+02	IV2506-023	Purchased K18YG 230SDC4 from Nakagawa	110.790		Beauty Bijoux	2025-10-07 10:40:36.116078+02	2025-10-07 10:40:36.116078+02	0.000	\N	Beauty Bijoux
b1b026c8-fc64-444b-bda6-0ce307726a72	2025-06-11 12:00:00+02	IV2506-023	Purchased K18WGPd10 230SDC4 from Nakagawa	135.890		Beauty Bijoux	2025-10-07 10:40:36.117065+02	2025-10-07 10:40:36.117065+02	0.000	\N	Beauty Bijoux
ab34e728-642b-49e7-86ca-080a08cd2e78	2025-06-11 12:00:00+02	IV2506-023	Purchased K18 Lobster 10mm "P+750" from Nakagawa	11.120		Beauty Bijoux	2025-10-07 10:40:36.118062+02	2025-10-07 10:40:36.118062+02	0.000	\N	Beauty Bijoux
739c6c3e-b00c-4715-b10a-35e233b88276	2025-06-11 12:00:00+02	IV2506-023	Purchased K18WGPD5 Lobster 10mm "P+750" NFRP from Nakagawa	12.980		Beauty Bijoux	2025-10-07 10:40:36.118946+02	2025-10-07 10:40:36.118946+02	0.000	\N	Beauty Bijoux
78d60707-48af-4a4c-9412-e6cf153393a2	2025-06-11 12:00:00+02	IV2506-023	Purchased K18YG LS4mm Slide Bead with PNK-15(V) from Nakagawa	5.380		Beauty Bijoux	2025-10-07 10:40:36.120059+02	2025-10-07 10:40:36.120059+02	0.000	\N	Beauty Bijoux
bbe67e32-cebf-4bc9-bbcb-28310a3ba27c	2025-06-11 12:00:00+02	IV2506-023	Purchased K18WGPd5 LS4mm Slide Bead with PNK-15(V) NFRP from Nakagawa	6.490		Beauty Bijoux	2025-10-07 10:40:36.121219+02	2025-10-07 10:40:36.121219+02	0.000	\N	Beauty Bijoux
3844cf9e-d11e-4868-9d5a-d61f69895875	2025-06-11 12:00:00+02	IV2506-023	Purchased K18 Lavalier Crown with Silicone "PASPALEY" from Nakagawa	15.300		Beauty Bijoux	2025-10-07 10:40:36.122506+02	2025-10-07 10:40:36.122506+02	0.000	\N	Beauty Bijoux
47423c20-ee71-48b1-acf9-9872a03f688c	2025-06-11 12:00:00+02	IV2506-023	Purchased K18WGPD1.25 Lavalier Crown with Silicone "PASPALEY" NFRP from Nakagawa	10.430		Beauty Bijoux	2025-10-07 10:40:36.123564+02	2025-10-07 10:40:36.123564+02	0.000	\N	Beauty Bijoux
4777189e-4c9e-4d74-90de-79859b48cd21	2025-06-12 12:00:00+02	Inv. 04525HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.125189+02	2025-10-07 10:40:36.125189+02	181.500	0.10	Beauty Bijoux
944984cb-7bb5-4013-967c-690678174ade	2025-06-12 12:00:00+02	Inv. 04625HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.12601+02	2025-10-07 10:40:36.12601+02	52.070	0.10	Beauty Bijoux
bdab93c9-8007-4b60-afa0-456dfc12dc1b	2025-06-13 12:00:00+02	Inv. 04725HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.126706+02	2025-10-07 10:40:36.126706+02	119.630	0.10	Beauty Bijoux
51f1a9e7-1933-40a0-8022-7ef5021e9b66	2025-06-14 12:00:00+02	Inv. 0222501	Goods for repair 18K from Poh Heng	0.000		Beauty Bijoux	2025-10-07 10:40:36.127448+02	2025-10-07 10:40:36.127448+02	118.670	\N	Beauty Bijoux
a7dead7a-bbbf-4ba5-ac16-5ef6fbffef32	2025-06-14 12:00:00+02	Inv. 0222502	Charged accessories 585/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.128321+02	2025-10-07 10:40:36.128321+02	0.850	\N	Beauty Bijoux
17c353d3-614f-45c1-b44b-e9ca099dbc46	2025-06-18 12:00:00+02	IV2506-029	Purchased K18WGPD1.25 Lavalier Crown with Silicone "PASPALEY" NFRP from Nakagawa	8.040		Beauty Bijoux	2025-10-07 10:40:36.12916+02	2025-10-07 10:40:36.12916+02	0.000	\N	Beauty Bijoux
e9d16ce1-c5ef-42bb-9a5b-93afda6a4076	2025-06-19 12:00:00+02	Delivery note 3007011	Received the returned samples from QI Services (Thailand) Ltd. (Bangkok)	6.320		Beauty Bijoux	2025-10-07 10:40:36.129915+02	2025-10-07 10:40:36.129915+02	0.000	\N	Beauty Bijoux
24f5373d-019d-48ef-8409-9638b24d42b8	2025-06-21 12:00:00+02	Inv. 0232501	Charged accessories 750/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.130689+02	2025-10-07 10:40:36.130689+02	0.270	\N	Beauty Bijoux
caa56466-62e5-4507-899f-3847359cb9fa	2025-06-21 12:00:00+02	Inv. 0232501	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.131451+02	2025-10-07 10:40:36.131451+02	3.520	\N	Beauty Bijoux
e29fef60-5567-4a8e-81c0-c77c3a26eaae	2025-06-24 12:00:00+02	Inv. 25003529	Purchased fine gold from Umicore	2000.000		Beauty Bijoux	2025-10-07 10:40:36.132235+02	2025-10-07 10:40:36.132235+02	0.000	\N	Beauty Bijoux
3df2a83e-e7d4-4aaf-a345-88c29752592f	2025-06-24 12:00:00+02	30121459/02/01-02	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.133062+02	2025-10-07 10:40:36.133062+02	26.420	0.00	Beauty Bijoux
2a6a1264-0141-4897-b4ce-dcf45d7e65dc	2025-06-24 12:00:00+02	30121460/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.134075+02	2025-10-07 10:40:36.134075+02	8.340	0.00	Beauty Bijoux
be021a6a-9e5b-49d6-89c3-901db78c1f23	2025-06-24 12:00:00+02	30121461/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.13505+02	2025-10-07 10:40:36.13505+02	4.110	0.00	Beauty Bijoux
6d172c07-3b42-4dd8-90a6-9352f75dd156	2025-06-26 12:00:00+02	Inv. 05425PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.135974+02	2025-10-07 10:40:36.135974+02	592.560	0.10	Beauty Bijoux
146d269f-eebb-4d38-94d0-aaa6fa489561	2025-06-26 12:00:00+02	Inv. 05525PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.137047+02	2025-10-07 10:40:36.137047+02	3.110	0.10	Beauty Bijoux
d07d4312-da6a-4a7e-af2a-64deac4637f8	2025-06-27 12:00:00+02	Inv. 05625PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.138281+02	2025-10-07 10:40:36.138281+02	252.950	0.10	Beauty Bijoux
a18f93e0-b23e-4614-a3ef-dcd64fc332f4	2025-06-27 12:00:00+02	Inv. 05725PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.139268+02	2025-10-07 10:40:36.139268+02	207.400	0.10	Beauty Bijoux
8084559f-4592-4428-9740-1b2d2138b578	2025-06-27 12:00:00+02	Inv. 04825HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.140349+02	2025-10-07 10:40:36.140349+02	64.350	0.10	Beauty Bijoux
ccbd6a73-2acd-47db-b5d4-51a2adc2fb36	2025-06-27 12:00:00+02	Inv. 04925HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.141343+02	2025-10-07 10:40:36.141343+02	206.250	0.10	Beauty Bijoux
fd15ce8b-c187-4e2f-be2b-9b079d592858	2025-06-28 12:00:00+02	Inv. 0242501	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.142229+02	2025-10-07 10:40:36.142229+02	1.750	\N	Beauty Bijoux
4f453253-9ef7-4cdb-9629-e51977c09de6	2025-06-30 12:00:00+02	Inv. 05825PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.143163+02	2025-10-07 10:40:36.143163+02	7.040	0.10	Beauty Bijoux
97f34035-fb8e-4797-9f5d-61220508b2ec	2025-06-30 12:00:00+02	Inv. 05925PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.144286+02	2025-10-07 10:40:36.144286+02	392.700	0.10	Beauty Bijoux
0f040c59-ad3f-4409-9f35-ea449f0f3a1b	2025-07-01 12:00:00+02	Proforma 20250625JWD	Received chain 18K (600mm x 2.80 mm) for production from Paspaley	12.730		Beauty Bijoux	2025-10-07 10:40:36.145683+02	2025-10-07 10:40:36.145683+02	0.000	\N	Beauty Bijoux
8c63ec3c-582c-4d27-ad26-47d794b5a0b6	2025-07-01 12:00:00+02	Proforma 20250625JWD	Received chain 18K (50mm x 1.75 mm) for production from Paspaley	0.400		Beauty Bijoux	2025-10-07 10:40:36.14679+02	2025-10-07 10:40:36.14679+02	0.000	\N	Beauty Bijoux
3a59c987-2600-49d1-8a51-c30c2c2de05e	2025-07-01 12:00:00+02	Proforma 20250625JWD	Received chain 18K (150mm x 1.75 mm) for production from Paspaley	1.190		Beauty Bijoux	2025-10-07 10:40:36.147767+02	2025-10-07 10:40:36.147767+02	0.000	\N	Beauty Bijoux
e483132d-7c32-41e0-9820-da7c09dd6db5	2025-07-01 12:00:00+02	Inv. 105325	Received accessories from Germany	17.800		Beauty Bijoux	2025-10-07 10:40:36.148678+02	2025-10-07 10:40:36.148678+02	0.000	\N	Beauty Bijoux
6923f663-e577-4a33-9553-5ae1dc0355c0	2025-07-02 12:00:00+02	Delivery note 3007016	Shipped Sample to QI Services (Thailand) Ltd. (Bangkok)	1.130		Beauty Bijoux	2025-10-07 10:40:36.149397+02	2025-10-07 10:40:36.149397+02	0.000	\N	Beauty Bijoux
d679dfad-8157-47b1-b03a-6f07140e6feb	2025-07-02 12:00:00+02	Delivery note 3007017	Shipped Platinum Samples to QI Services (Thailand) Ltd. (Bangkok)	1.790		Beauty Bijoux	2025-10-07 10:40:36.150302+02	2025-10-07 10:40:36.150302+02	0.000	\N	Beauty Bijoux
0d323e78-b3c1-47fe-befd-ddba0d5637ef	2025-07-04 12:00:00+02	Inv. 06025PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.15118+02	2025-10-07 10:40:36.15118+02	6.240	0.10	Beauty Bijoux
866d94a4-a85d-49f5-8a6f-b87df1c009ba	2025-07-04 12:00:00+02	Inv. 06125PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.152142+02	2025-10-07 10:40:36.152142+02	16.080	0.10	Beauty Bijoux
3f16e45f-cb64-475d-8c9b-28aeab2a673a	2025-07-04 12:00:00+02	Inv. 06225PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.153104+02	2025-10-07 10:40:36.153104+02	85.400	0.10	Beauty Bijoux
3d31b72f-0c3f-4aad-bf2f-161a03c4e92e	2025-07-04 12:00:00+02	Inv. 06325PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.154298+02	2025-10-07 10:40:36.154298+02	77.760	0.10	Beauty Bijoux
3833dad6-8424-49b9-9315-d30bd9b7fd76	2025-07-04 12:00:00+02	Inv. 06425PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.155465+02	2025-10-07 10:40:36.155465+02	58.580	0.10	Beauty Bijoux
1c04ff40-2486-4c66-bdd5-8ac305ae6652	2025-07-05 12:00:00+02	Inv. 0252501	Charged accessories 333/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.156489+02	2025-10-07 10:40:36.156489+02	0.390	\N	Beauty Bijoux
a85ca8d9-e332-4b5c-ae1f-2ac20098219f	2025-07-08 12:00:00+02	Inv. 105525	Received gold sheet 375/- from Germany	92.100		Beauty Bijoux	2025-10-07 10:40:36.157395+02	2025-10-07 10:40:36.157395+02	0.000	\N	Beauty Bijoux
c3ff4edf-1283-43b9-8b63-f1db1fc689c0	2025-07-08 12:00:00+02	Inv. 105525	Received accessories from Germany	4.550		Beauty Bijoux	2025-10-07 10:40:36.158286+02	2025-10-07 10:40:36.158286+02	0.000	\N	Beauty Bijoux
ed06ee2f-954d-4b10-91bf-4a0518d7ff29	2025-07-08 12:00:00+02	IV2507-015	Purchased K18YG 230SDC4 from Nakagawa	133.860		Beauty Bijoux	2025-10-07 10:40:36.158986+02	2025-10-07 10:40:36.158986+02	0.000	\N	Beauty Bijoux
886bb986-2c9b-41fe-a563-519854b2ba3e	2025-07-08 12:00:00+02	IV2507-015	Purchased K18WGPd10 230SDC4 from Nakagawa	26.700		Beauty Bijoux	2025-10-07 10:40:36.159758+02	2025-10-07 10:40:36.159758+02	0.000	\N	Beauty Bijoux
1f639470-ada0-421a-9d8d-35c5d7cda828	2025-07-08 12:00:00+02	IV2507-015	Purchased K18PG 230SDC4 from Nakagawa	24.180		Beauty Bijoux	2025-10-07 10:40:36.160608+02	2025-10-07 10:40:36.160608+02	0.000	\N	Beauty Bijoux
d308f6db-b65e-49ae-a8fb-be2bcd605d4b	2025-07-08 12:00:00+02	IV2507-015	Purchased K18 Lobster 10mm "P+750" from Nakagawa	14.800		Beauty Bijoux	2025-10-07 10:40:36.161596+02	2025-10-07 10:40:36.161596+02	0.000	\N	Beauty Bijoux
ff017baa-9e0b-48a4-ab6f-7f6b578a944c	2025-07-08 12:00:00+02	IV2507-015	Purchased K18WGPD5 Lobster 10mm "P+750" NFRP from Nakagawa	1.880		Beauty Bijoux	2025-10-07 10:40:36.16278+02	2025-10-07 10:40:36.16278+02	0.000	\N	Beauty Bijoux
df9e16ce-2ef3-4c5d-8e0f-658da2e43275	2025-07-08 12:00:00+02	IV2507-015	Purchased K18PG Lobster 10mm "P+750" from Nakagawa	1.830		Beauty Bijoux	2025-10-07 10:40:36.163814+02	2025-10-07 10:40:36.163814+02	0.000	\N	Beauty Bijoux
65ef75de-ceea-40e5-8e94-9dce0a278204	2025-07-08 12:00:00+02	IV2507-015	Purchased K18YG LS4mm Slide Bead with PNK-15(V) from Nakagawa	7.620		Beauty Bijoux	2025-10-07 10:40:36.164602+02	2025-10-07 10:40:36.164602+02	0.000	\N	Beauty Bijoux
c0a57934-004a-435e-bdf9-4a8c79f1bd27	2025-07-08 12:00:00+02	IV2507-015	Purchased K18PG LS4mm Slide Bead with PNK-15(V) from Nakagawa	0.920		Beauty Bijoux	2025-10-07 10:40:36.165356+02	2025-10-07 10:40:36.165356+02	0.000	\N	Beauty Bijoux
0fd46ebf-0451-4d07-8027-f83e100c98b7	2025-07-08 12:00:00+02	IV2507-015	Purchased K18 Lavalier Crown with Silicone "PASPALEY" from Nakagawa	20.400		Beauty Bijoux	2025-10-07 10:40:36.16642+02	2025-10-07 10:40:36.16642+02	0.000	\N	Beauty Bijoux
fb91a16d-40b3-4198-bdc3-32fb1d6548d3	2025-07-08 12:00:00+02	IV2507-015	Purchased K18WGPD1.25 Lavalier Crown with Silicone "PASPALEY" NFRP from Nakagawa	2.620		Beauty Bijoux	2025-10-07 10:40:36.167178+02	2025-10-07 10:40:36.167178+02	0.000	\N	Beauty Bijoux
6d786df1-4229-4549-ae72-56fd012daa4f	2025-07-08 12:00:00+02	IV2507-015	Purchased K18PG Lavalier Crown with Silicone "PASPALEY" from Nakagawa	2.550		Beauty Bijoux	2025-10-07 10:40:36.167954+02	2025-10-07 10:40:36.167954+02	0.000	\N	Beauty Bijoux
1549f57e-01a2-4c0b-a0ed-95571d26dda8	2025-07-08 12:00:00+02	Inv. 06525PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.169768+02	2025-10-07 10:40:36.169768+02	2.190	0.10	Beauty Bijoux
80cf92b1-6a67-4279-a57c-86f891c6e057	2025-07-08 12:00:00+02	Inv. 06625PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.171034+02	2025-10-07 10:40:36.171034+02	64.350	0.10	Beauty Bijoux
cb1ac30c-52b7-46ea-8cdb-a50545cccc43	2025-07-09 12:00:00+02	30122430/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.172242+02	2025-10-07 10:40:36.172242+02	1.940	0.00	Beauty Bijoux
2c07bd42-cfc5-458b-8823-59b236ee8eed	2025-07-09 12:00:00+02	30122431/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.173329+02	2025-10-07 10:40:36.173329+02	0.600	0.00	Beauty Bijoux
a885221f-8f0d-4624-972b-69bffe15827d	2025-07-09 12:00:00+02	30122432/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.174199+02	2025-10-07 10:40:36.174199+02	0.720	0.00	Beauty Bijoux
f69dbf12-2de4-4141-a031-b8739d361847	2025-07-09 12:00:00+02	30122433/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.175+02	2025-10-07 10:40:36.175+02	0.090	0.00	Beauty Bijoux
c24e03f5-fc3f-4960-91d7-de31fa817841	2025-07-09 12:00:00+02	30122434/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.175864+02	2025-10-07 10:40:36.175864+02	0.590	0.00	Beauty Bijoux
82bc48ab-bf3e-4b6d-9a2a-9e901449ee27	2025-07-12 12:00:00+02	Inv. 00925SP	Export to Aspial by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.176761+02	2025-10-07 10:40:36.176761+02	3.390	0.10	Beauty Bijoux
cdc34b49-81e0-45cd-bb64-592a4f8c19ca	2025-07-12 12:00:00+02	Inv. 01025SP	Export to Aspial by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.177925+02	2025-10-07 10:40:36.177925+02	10.110	0.10	Beauty Bijoux
122fc914-258b-4662-9c7a-fbdbc3592f36	2025-07-12 12:00:00+02	Inv. 0262501	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.179189+02	2025-10-07 10:40:36.179189+02	2.730	\N	Beauty Bijoux
4e27ea62-3ef2-416c-8471-3cbce2f7315a	2025-07-14 12:00:00+02	Inv. 05025HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.180267+02	2025-10-07 10:40:36.180267+02	135.890	0.10	Beauty Bijoux
ed7a559b-d819-497b-9dc0-675c32af58d7	2025-07-14 12:00:00+02	Inv. 05125HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.18125+02	2025-10-07 10:40:36.18125+02	62.960	0.10	Beauty Bijoux
9d30d489-f19f-44f2-a5ba-5930ac82d4f2	2025-07-14 12:00:00+02	Inv. 05225HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.18202+02	2025-10-07 10:40:36.18202+02	23.930	0.10	Beauty Bijoux
503e624e-2bfc-4fba-8d09-599ae4f7f9f6	2025-07-15 12:00:00+02	IV2507-034	Purchased K18WGPd5 LS4mm Slide Bead with PNK-15(V) NFRP from Nakagawa	0.930		Beauty Bijoux	2025-10-07 10:40:36.182944+02	2025-10-07 10:40:36.182944+02	0.000	\N	Beauty Bijoux
74d3f4d3-3e7e-47b8-8d16-8514eeba7039	2025-07-15 12:00:00+02	Inv. 05325HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.183959+02	2025-10-07 10:40:36.183959+02	108.900	0.10	Beauty Bijoux
4d42a08b-0e7d-4a08-84a9-559994caf31d	2025-07-15 12:00:00+02	Inv. 05425HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.184735+02	2025-10-07 10:40:36.184735+02	41.250	0.10	Beauty Bijoux
4c179b33-8098-4637-a478-7c830df57724	2025-07-15 12:00:00+02	Inv. 05525HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.18555+02	2025-10-07 10:40:36.18555+02	125.780	0.10	Beauty Bijoux
e27f61a5-e32c-469f-af57-1a917665b333	2025-07-16 12:00:00+02	Inv. 05625HK	Export to Malaysia by FedEx	0.000		Beauty Bijoux	2025-10-07 10:40:36.186494+02	2025-10-07 10:40:36.186494+02	113.240	0.10	Beauty Bijoux
a6b2b50f-b19c-418a-af10-e2ac3e074740	2025-07-16 12:00:00+02	30122804/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.188884+02	2025-10-07 10:40:36.188884+02	26.220	0.00	Beauty Bijoux
09b2a3e6-19b6-4afa-bad4-99570cf9c20e	2025-07-16 12:00:00+02	30122805/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.189805+02	2025-10-07 10:40:36.189805+02	10.060	0.00	Beauty Bijoux
1ab59c2f-7f80-42fd-9093-582a42e0619f	2025-07-16 12:00:00+02	30122807/02/01	Refining charged from Umicore	0.000		Beauty Bijoux	2025-10-07 10:40:36.190549+02	2025-10-07 10:40:36.190549+02	5.470	0.00	Beauty Bijoux
6115f643-4eb5-4615-9e52-8cd842bbb7b6	2025-07-17 12:00:00+02	Inv. 06725PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.191261+02	2025-10-07 10:40:36.191261+02	46.040	0.10	Beauty Bijoux
54aa66f9-d1e8-4245-9d32-569fb416a4fa	2025-07-17 12:00:00+02	Inv. 06825PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.191965+02	2025-10-07 10:40:36.191965+02	143.100	0.10	Beauty Bijoux
89df487b-99f3-4bfb-9398-a3f302c5e958	2025-07-18 12:00:00+02	Inv. 06925PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.192719+02	2025-10-07 10:40:36.192719+02	71.910	0.10	Beauty Bijoux
524b9b7f-5de8-4956-acc5-578afb4f2cb1	2025-07-18 12:00:00+02	Inv. 07025PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.193462+02	2025-10-07 10:40:36.193462+02	465.060	0.10	Beauty Bijoux
f2e2c7bb-0e6e-4949-9841-1717c4c86a97	2025-07-18 12:00:00+02	Inv. 07125PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.194181+02	2025-10-07 10:40:36.194181+02	11.930	0.10	Beauty Bijoux
ffb3a8b2-6349-426d-ae9e-cee8904715e4	2025-07-19 12:00:00+02	Inv. 0272501	Charged accessories 333/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.194965+02	2025-10-07 10:40:36.194965+02	0.050	\N	Beauty Bijoux
eed5eefc-c1e2-445b-881d-f4940f17f94f	2025-07-19 12:00:00+02	Inv. 0272501	Charged accessories 585/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.195669+02	2025-10-07 10:40:36.195669+02	0.340	\N	Beauty Bijoux
d6055d12-cef7-4d15-bc84-0a0d99d660ab	2025-07-19 12:00:00+02	Inv. 0272501	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.19644+02	2025-10-07 10:40:36.19644+02	5.410	\N	Beauty Bijoux
78de1fb3-de2f-464a-83c8-fd973dd10023	2025-07-21 12:00:00+02	Inv. 07225PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.197297+02	2025-10-07 10:40:36.197297+02	784.830	0.10	Beauty Bijoux
9cb60c54-7e2b-4af3-900f-449dc0e79330	2025-07-21 12:00:00+02	Inv. 07325PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.198164+02	2025-10-07 10:40:36.198164+02	34.530	0.10	Beauty Bijoux
bf8a6aa6-6484-445e-b6e9-7bcb7df48456	2025-07-22 12:00:00+02	Inv. 07425PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.199071+02	2025-10-07 10:40:36.199071+02	254.850	0.10	Beauty Bijoux
4f5e8087-0ee2-450c-83f1-ea812702ea70	2025-07-22 12:00:00+02	Inv. 07525PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.199855+02	2025-10-07 10:40:36.199855+02	13.290	0.10	Beauty Bijoux
c64a3eba-a00d-4477-bf43-a849ea08aa51	2025-07-22 12:00:00+02	Inv. 105925	Received accessories for direct customer 7514 from Germany	30.090		Beauty Bijoux	2025-10-07 10:40:36.20069+02	2025-10-07 10:40:36.20069+02	0.000	\N	Beauty Bijoux
1b95aa5e-47d7-4bfb-ac25-be7a6b4c9cb5	2025-07-22 12:00:00+02	Inv. 105925	Received ring samples for testing from Germany (Attn. K. Dan)	6.270		Beauty Bijoux	2025-10-07 10:40:36.201552+02	2025-10-07 10:40:36.201552+02	0.000	\N	Beauty Bijoux
50820637-62df-4c01-b8fa-fd505ce304bc	2025-07-26 12:00:00+02	Inv. 0282503	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.202718+02	2025-10-07 10:40:36.202718+02	0.510	\N	Beauty Bijoux
258a3e71-c450-4730-b790-9836f823f3ee	2025-07-26 12:00:00+02	Inv. 0282503	Charged accessories 333/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.203884+02	2025-10-07 10:40:36.203884+02	0.520	\N	Beauty Bijoux
eee8f738-087f-48b3-9f0f-1d32da480a52	2025-07-29 12:00:00+02	Inv. 106225	Received rings for testing from Germany (Attn. K. Dan)	19.800		Beauty Bijoux	2025-10-07 10:40:36.205064+02	2025-10-07 10:40:36.205064+02	0.000	\N	Beauty Bijoux
3f37063e-1821-4d40-8b75-5e9402e27d6e	2025-07-29 12:00:00+02	Inv. 106225	Received accessories from Germany	7.360		Beauty Bijoux	2025-10-07 10:40:36.206036+02	2025-10-07 10:40:36.206036+02	0.000	\N	Beauty Bijoux
1063d864-5d10-48b0-a025-01df52f1e9c0	2025-07-29 12:00:00+02	Inv. 106225	Received flat wire 18K from Germany	76.630		Beauty Bijoux	2025-10-07 10:40:36.206874+02	2025-10-07 10:40:36.206874+02	0.000	\N	Beauty Bijoux
af049a3d-eb0f-4244-a600-5c053be5d36d	2025-07-29 12:00:00+02	Inv. 25004284	Purchased fine gold from Umicore	3000.000		Beauty Bijoux	2025-10-07 10:40:36.207709+02	2025-10-07 10:40:36.207709+02	0.000	\N	Beauty Bijoux
f3fa79cc-d523-4cd1-88f7-1e1ecec9d09f	2025-07-29 12:00:00+02	Inv. 07625PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.208585+02	2025-10-07 10:40:36.208585+02	389.400	0.10	Beauty Bijoux
837aaf53-bc2c-4aa4-87a5-2740d46c6926	2025-07-29 12:00:00+02	Inv. 07725PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.209761+02	2025-10-07 10:40:36.209761+02	0.820	0.10	Beauty Bijoux
e049101c-2cd1-4154-96c6-c95b76846123	2025-07-30 12:00:00+02	Inv. 07825PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.210867+02	2025-10-07 10:40:36.210867+02	318.000	0.10	Beauty Bijoux
a5c13bb8-8239-444f-88f3-453a96dc9d58	2025-07-30 12:00:00+02	Inv. 07925PPY	Export to Paspaley by DHL	0.000		Beauty Bijoux	2025-10-07 10:40:36.211589+02	2025-10-07 10:40:36.211589+02	105.690	0.10	Beauty Bijoux
cadaa601-aae7-4954-8ae2-8007625794a7	2025-07-31 12:00:00+02	Inv. 0292501	Charged accessories 333/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.21229+02	2025-10-07 10:40:36.21229+02	0.110	\N	Beauty Bijoux
8d013e54-8dd9-41d3-973b-dead2e2b61f0	2025-07-31 12:00:00+02	Inv. 0292501	Charged gold sheet 375/- BB Stock	0.000		Beauty Bijoux	2025-10-07 10:40:36.21304+02	2025-10-07 10:40:36.21304+02	51.430	\N	Beauty Bijoux
9b433610-55ba-49cc-afe6-5cf3d20fbd62	2025-07-16 12:00:00+02	LS/106	Local sale	0.000		Beauty Bijoux	2025-10-07 10:40:36.187851+02	2025-10-07 10:57:35.779512+02	2.300	0.10	Beauty Bijoux
\.


--
-- Name: gold_record gold_record_pkey; Type: CONSTRAINT; Schema: public; Owner: bb_user
--

ALTER TABLE ONLY public.gold_record
    ADD CONSTRAINT gold_record_pkey PRIMARY KEY (id);


--
-- Name: idx_gold_record_category; Type: INDEX; Schema: public; Owner: bb_user
--

CREATE INDEX idx_gold_record_category ON public.gold_record USING btree (category);


--
-- Name: idx_gold_record_gold_out; Type: INDEX; Schema: public; Owner: bb_user
--

CREATE INDEX idx_gold_record_gold_out ON public.gold_record USING btree (gold_out_grams);


--
-- Name: idx_gold_record_ledger; Type: INDEX; Schema: public; Owner: bb_user
--

CREATE INDEX idx_gold_record_ledger ON public.gold_record USING btree (ledger);


--
-- Name: idx_gold_record_net_gold; Type: INDEX; Schema: public; Owner: bb_user
--

CREATE INDEX idx_gold_record_net_gold ON public.gold_record USING btree (net_gold_grams);


--
-- Name: idx_gold_record_reference; Type: INDEX; Schema: public; Owner: bb_user
--

CREATE INDEX idx_gold_record_reference ON public.gold_record USING btree (reference_number);


--
-- Name: idx_gold_record_timestamp; Type: INDEX; Schema: public; Owner: bb_user
--

CREATE INDEX idx_gold_record_timestamp ON public.gold_record USING btree (timestamp_tz);


--
-- Name: gold_record update_gold_record_updated_at; Type: TRIGGER; Schema: public; Owner: bb_user
--

CREATE TRIGGER update_gold_record_updated_at BEFORE UPDATE ON public.gold_record FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- PostgreSQL database dump complete
--

\unrestrict d5UuwVhG50z9FIg6eVKDa9jLae346XQCVBIyrP5q8zFBvidY4FlpDUwMadDQDqe

