--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-05-11 11:39:12

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 7 (class 2615 OID 16388)
-- Name: students; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA students;


ALTER SCHEMA students OWNER TO postgres;

--
-- TOC entry 2 (class 3079 OID 59815)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 6029 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 16407)
-- Name: auth; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth (
    id integer NOT NULL,
    username character varying(55) NOT NULL,
    password character varying(255) NOT NULL,
    is_active boolean DEFAULT true,
    token_version text
);


ALTER TABLE public.auth OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16406)
-- Name: auth_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auth_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auth_id_seq OWNER TO postgres;

--
-- TOC entry 6030 (class 0 OID 0)
-- Dependencies: 219
-- Name: auth_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auth_id_seq OWNED BY public.auth.id;


--
-- TOC entry 256 (class 1259 OID 41913)
-- Name: classteacher_remark; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.classteacher_remark (
    id integer NOT NULL,
    comment text NOT NULL
);


ALTER TABLE public.classteacher_remark OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 41899)
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    comment text NOT NULL
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- TOC entry 276 (class 1259 OID 59539)
-- Name: end_term_1_form_1_2025; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.end_term_1_form_1_2025 (
    id integer NOT NULL,
    "101" integer DEFAULT 0,
    "101_1" integer DEFAULT 0,
    "101_2" integer DEFAULT 0,
    "101_3" integer DEFAULT 0,
    "102" integer DEFAULT 0,
    "102_1" integer DEFAULT 0,
    "102_2" integer DEFAULT 0,
    "102_3" integer DEFAULT 0,
    "121" integer DEFAULT 0,
    "121_1" integer DEFAULT 0,
    "121_2" integer DEFAULT 0,
    "121_3" integer DEFAULT 0,
    "122" integer DEFAULT 0,
    "122_1" integer DEFAULT 0,
    "122_2" integer DEFAULT 0,
    "122_3" integer DEFAULT 0,
    "231" integer DEFAULT 0,
    "231_1" integer DEFAULT 0,
    "231_2" integer DEFAULT 0,
    "231_3" integer DEFAULT 0,
    "232" integer DEFAULT 0,
    "232_1" integer DEFAULT 0,
    "232_2" integer DEFAULT 0,
    "232_3" integer DEFAULT 0,
    "233" integer DEFAULT 0,
    "233_1" integer DEFAULT 0,
    "233_2" integer DEFAULT 0,
    "233_3" integer DEFAULT 0,
    "236" integer DEFAULT 0,
    "236_1" integer DEFAULT 0,
    "236_2" integer DEFAULT 0,
    "236_3" integer DEFAULT 0,
    "237" integer DEFAULT 0,
    "237_1" integer DEFAULT 0,
    "237_2" integer DEFAULT 0,
    "237_3" integer DEFAULT 0,
    "311" integer DEFAULT 0,
    "311_1" integer DEFAULT 0,
    "311_2" integer DEFAULT 0,
    "311_3" integer DEFAULT 0,
    "312" integer DEFAULT 0,
    "312_1" integer DEFAULT 0,
    "312_2" integer DEFAULT 0,
    "312_3" integer DEFAULT 0,
    "313" integer DEFAULT 0,
    "313_1" integer DEFAULT 0,
    "313_2" integer DEFAULT 0,
    "313_3" integer DEFAULT 0,
    "314" integer DEFAULT 0,
    "314_1" integer DEFAULT 0,
    "314_2" integer DEFAULT 0,
    "314_3" integer DEFAULT 0,
    "315" integer DEFAULT 0,
    "315_1" integer DEFAULT 0,
    "315_2" integer DEFAULT 0,
    "315_3" integer DEFAULT 0,
    "441" integer DEFAULT 0,
    "441_1" integer DEFAULT 0,
    "441_2" integer DEFAULT 0,
    "441_3" integer DEFAULT 0,
    "442" integer DEFAULT 0,
    "442_1" integer DEFAULT 0,
    "442_2" integer DEFAULT 0,
    "442_3" integer DEFAULT 0,
    "443" integer DEFAULT 0,
    "443_1" integer DEFAULT 0,
    "443_2" integer DEFAULT 0,
    "443_3" integer DEFAULT 0,
    "444" integer DEFAULT 0,
    "444_1" integer DEFAULT 0,
    "444_2" integer DEFAULT 0,
    "444_3" integer DEFAULT 0,
    "445" integer DEFAULT 0,
    "445_1" integer DEFAULT 0,
    "445_2" integer DEFAULT 0,
    "445_3" integer DEFAULT 0,
    "446" integer DEFAULT 0,
    "446_1" integer DEFAULT 0,
    "446_2" integer DEFAULT 0,
    "446_3" integer DEFAULT 0,
    "447" integer DEFAULT 0,
    "447_1" integer DEFAULT 0,
    "447_2" integer DEFAULT 0,
    "447_3" integer DEFAULT 0,
    "448" integer DEFAULT 0,
    "448_1" integer DEFAULT 0,
    "448_2" integer DEFAULT 0,
    "448_3" integer DEFAULT 0,
    "449" integer DEFAULT 0,
    "449_1" integer DEFAULT 0,
    "449_2" integer DEFAULT 0,
    "449_3" integer DEFAULT 0,
    "450" integer DEFAULT 0,
    "450_1" integer DEFAULT 0,
    "450_2" integer DEFAULT 0,
    "450_3" integer DEFAULT 0,
    "451" integer DEFAULT 0,
    "451_1" integer DEFAULT 0,
    "451_2" integer DEFAULT 0,
    "451_3" integer DEFAULT 0,
    "501" integer DEFAULT 0,
    "501_1" integer DEFAULT 0,
    "501_2" integer DEFAULT 0,
    "501_3" integer DEFAULT 0,
    "502" integer DEFAULT 0,
    "502_1" integer DEFAULT 0,
    "502_2" integer DEFAULT 0,
    "502_3" integer DEFAULT 0,
    "503" integer DEFAULT 0,
    "503_1" integer DEFAULT 0,
    "503_2" integer DEFAULT 0,
    "503_3" integer DEFAULT 0,
    "511" integer DEFAULT 0,
    "511_1" integer DEFAULT 0,
    "511_2" integer DEFAULT 0,
    "511_3" integer DEFAULT 0,
    "565" integer DEFAULT 0,
    "565_1" integer DEFAULT 0,
    "565_2" integer DEFAULT 0,
    "565_3" integer DEFAULT 0
);


ALTER TABLE public.end_term_1_form_1_2025 OWNER TO postgres;

--
-- TOC entry 282 (class 1259 OID 59795)
-- Name: end_term_1_form_1_2025_paper_setup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.end_term_1_form_1_2025_paper_setup (
    id integer NOT NULL,
    papers integer DEFAULT 3 NOT NULL,
    formula character varying(55) DEFAULT 'twoPaperAvg'::character varying NOT NULL
);


ALTER TABLE public.end_term_1_form_1_2025_paper_setup OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 34550)
-- Name: end_term_1_form_4_2025; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.end_term_1_form_4_2025 (
    id integer NOT NULL,
    "101" integer DEFAULT 0,
    "101_1" integer DEFAULT 0,
    "101_2" integer DEFAULT 0,
    "101_3" integer DEFAULT 0,
    "102" integer DEFAULT 0,
    "102_1" integer DEFAULT 0,
    "102_2" integer DEFAULT 0,
    "102_3" integer DEFAULT 0,
    "121" integer DEFAULT 0,
    "121_1" integer DEFAULT 0,
    "121_2" integer DEFAULT 0,
    "121_3" integer DEFAULT 0,
    "122" integer DEFAULT 0,
    "122_1" integer DEFAULT 0,
    "122_2" integer DEFAULT 0,
    "122_3" integer DEFAULT 0,
    "231" integer DEFAULT 0,
    "231_1" integer DEFAULT 0,
    "231_2" integer DEFAULT 0,
    "231_3" integer DEFAULT 0,
    "232" integer DEFAULT 0,
    "232_1" integer DEFAULT 0,
    "232_2" integer DEFAULT 0,
    "232_3" integer DEFAULT 0,
    "233" integer DEFAULT 0,
    "233_1" integer DEFAULT 0,
    "233_2" integer DEFAULT 0,
    "233_3" integer DEFAULT 0,
    "236" integer DEFAULT 0,
    "236_1" integer DEFAULT 0,
    "236_2" integer DEFAULT 0,
    "236_3" integer DEFAULT 0,
    "237" integer DEFAULT 0,
    "237_1" integer DEFAULT 0,
    "237_2" integer DEFAULT 0,
    "237_3" integer DEFAULT 0,
    "311" integer DEFAULT 0,
    "311_1" integer DEFAULT 0,
    "311_2" integer DEFAULT 0,
    "311_3" integer DEFAULT 0,
    "312" integer DEFAULT 0,
    "312_1" integer DEFAULT 0,
    "312_2" integer DEFAULT 0,
    "312_3" integer DEFAULT 0,
    "313" integer DEFAULT 0,
    "313_1" integer DEFAULT 0,
    "313_2" integer DEFAULT 0,
    "313_3" integer DEFAULT 0,
    "314" integer DEFAULT 0,
    "314_1" integer DEFAULT 0,
    "314_2" integer DEFAULT 0,
    "314_3" integer DEFAULT 0,
    "315" integer DEFAULT 0,
    "315_1" integer DEFAULT 0,
    "315_2" integer DEFAULT 0,
    "315_3" integer DEFAULT 0,
    "441" integer DEFAULT 0,
    "441_1" integer DEFAULT 0,
    "441_2" integer DEFAULT 0,
    "441_3" integer DEFAULT 0,
    "442" integer DEFAULT 0,
    "442_1" integer DEFAULT 0,
    "442_2" integer DEFAULT 0,
    "442_3" integer DEFAULT 0,
    "443" integer DEFAULT 0,
    "443_1" integer DEFAULT 0,
    "443_2" integer DEFAULT 0,
    "443_3" integer DEFAULT 0,
    "444" integer DEFAULT 0,
    "444_1" integer DEFAULT 0,
    "444_2" integer DEFAULT 0,
    "444_3" integer DEFAULT 0,
    "445" integer DEFAULT 0,
    "445_1" integer DEFAULT 0,
    "445_2" integer DEFAULT 0,
    "445_3" integer DEFAULT 0,
    "446" integer DEFAULT 0,
    "446_1" integer DEFAULT 0,
    "446_2" integer DEFAULT 0,
    "446_3" integer DEFAULT 0,
    "447" integer DEFAULT 0,
    "447_1" integer DEFAULT 0,
    "447_2" integer DEFAULT 0,
    "447_3" integer DEFAULT 0,
    "448" integer DEFAULT 0,
    "448_1" integer DEFAULT 0,
    "448_2" integer DEFAULT 0,
    "448_3" integer DEFAULT 0,
    "449" integer DEFAULT 0,
    "449_1" integer DEFAULT 0,
    "449_2" integer DEFAULT 0,
    "449_3" integer DEFAULT 0,
    "450" integer DEFAULT 0,
    "450_1" integer DEFAULT 0,
    "450_2" integer DEFAULT 0,
    "450_3" integer DEFAULT 0,
    "451" integer DEFAULT 0,
    "451_1" integer DEFAULT 0,
    "451_2" integer DEFAULT 0,
    "451_3" integer DEFAULT 0,
    "501" integer DEFAULT 0,
    "501_1" integer DEFAULT 0,
    "501_2" integer DEFAULT 0,
    "501_3" integer DEFAULT 0,
    "502" integer DEFAULT 0,
    "502_1" integer DEFAULT 0,
    "502_2" integer DEFAULT 0,
    "502_3" integer DEFAULT 0,
    "503" integer DEFAULT 0,
    "503_1" integer DEFAULT 0,
    "503_2" integer DEFAULT 0,
    "503_3" integer DEFAULT 0,
    "511" integer DEFAULT 0,
    "511_1" integer DEFAULT 0,
    "511_2" integer DEFAULT 0,
    "511_3" integer DEFAULT 0,
    "565" integer DEFAULT 0,
    "565_1" integer DEFAULT 0,
    "565_2" integer DEFAULT 0,
    "565_3" integer DEFAULT 0
);


ALTER TABLE public.end_term_1_form_4_2025 OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 34760)
-- Name: end_term_1_form_4_2025_paper_setup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.end_term_1_form_4_2025_paper_setup (
    id integer NOT NULL,
    papers integer DEFAULT 3 NOT NULL,
    formula character varying(55) DEFAULT 'twoPaperAvg'::character varying NOT NULL
);


ALTER TABLE public.end_term_1_form_4_2025_paper_setup OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 33449)
-- Name: form_1_exams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form_1_exams (
    id integer NOT NULL,
    exam_name character varying(255) NOT NULL,
    term integer NOT NULL,
    year character varying(5) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.form_1_exams OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 33448)
-- Name: form_1_exams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.form_1_exams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.form_1_exams_id_seq OWNER TO postgres;

--
-- TOC entry 6031 (class 0 OID 0)
-- Dependencies: 229
-- Name: form_1_exams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.form_1_exams_id_seq OWNED BY public.form_1_exams.id;


--
-- TOC entry 247 (class 1259 OID 41839)
-- Name: form_1_streams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form_1_streams (
    id integer NOT NULL,
    stream_name character varying(55) NOT NULL,
    year integer NOT NULL,
    teacher_id integer NOT NULL,
    status integer DEFAULT 1
);


ALTER TABLE public.form_1_streams OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 41838)
-- Name: form_1_streams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.form_1_streams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.form_1_streams_id_seq OWNER TO postgres;

--
-- TOC entry 6032 (class 0 OID 0)
-- Dependencies: 246
-- Name: form_1_streams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.form_1_streams_id_seq OWNED BY public.form_1_streams.id;


--
-- TOC entry 232 (class 1259 OID 33459)
-- Name: form_2_exams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form_2_exams (
    id integer NOT NULL,
    exam_name character varying(255) NOT NULL,
    term integer NOT NULL,
    year character varying(5) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.form_2_exams OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 33458)
-- Name: form_2_exams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.form_2_exams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.form_2_exams_id_seq OWNER TO postgres;

--
-- TOC entry 6033 (class 0 OID 0)
-- Dependencies: 231
-- Name: form_2_exams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.form_2_exams_id_seq OWNED BY public.form_2_exams.id;


--
-- TOC entry 249 (class 1259 OID 41855)
-- Name: form_2_streams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form_2_streams (
    id integer NOT NULL,
    stream_name character varying(55) NOT NULL,
    year integer NOT NULL,
    teacher_id integer NOT NULL,
    status integer DEFAULT 1
);


ALTER TABLE public.form_2_streams OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 41854)
-- Name: form_2_streams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.form_2_streams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.form_2_streams_id_seq OWNER TO postgres;

--
-- TOC entry 6034 (class 0 OID 0)
-- Dependencies: 248
-- Name: form_2_streams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.form_2_streams_id_seq OWNED BY public.form_2_streams.id;


--
-- TOC entry 234 (class 1259 OID 33469)
-- Name: form_3_exams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form_3_exams (
    id integer NOT NULL,
    exam_name character varying(255) NOT NULL,
    term integer NOT NULL,
    year character varying(5) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.form_3_exams OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 33468)
-- Name: form_3_exams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.form_3_exams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.form_3_exams_id_seq OWNER TO postgres;

--
-- TOC entry 6035 (class 0 OID 0)
-- Dependencies: 233
-- Name: form_3_exams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.form_3_exams_id_seq OWNED BY public.form_3_exams.id;


--
-- TOC entry 251 (class 1259 OID 41870)
-- Name: form_3_streams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form_3_streams (
    id integer NOT NULL,
    stream_name character varying(55) NOT NULL,
    year integer NOT NULL,
    teacher_id integer NOT NULL,
    status integer DEFAULT 1
);


ALTER TABLE public.form_3_streams OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 41869)
-- Name: form_3_streams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.form_3_streams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.form_3_streams_id_seq OWNER TO postgres;

--
-- TOC entry 6036 (class 0 OID 0)
-- Dependencies: 250
-- Name: form_3_streams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.form_3_streams_id_seq OWNED BY public.form_3_streams.id;


--
-- TOC entry 236 (class 1259 OID 33479)
-- Name: form_4_exams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form_4_exams (
    id integer NOT NULL,
    exam_name character varying(255) NOT NULL,
    term integer NOT NULL,
    year character varying(5) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.form_4_exams OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 33478)
-- Name: form_4_exams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.form_4_exams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.form_4_exams_id_seq OWNER TO postgres;

--
-- TOC entry 6037 (class 0 OID 0)
-- Dependencies: 235
-- Name: form_4_exams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.form_4_exams_id_seq OWNED BY public.form_4_exams.id;


--
-- TOC entry 253 (class 1259 OID 41885)
-- Name: form_4_streams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form_4_streams (
    id integer NOT NULL,
    stream_name character varying(55) NOT NULL,
    year integer NOT NULL,
    teacher_id integer NOT NULL,
    status integer DEFAULT 1
);


ALTER TABLE public.form_4_streams OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 41884)
-- Name: form_4_streams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.form_4_streams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.form_4_streams_id_seq OWNER TO postgres;

--
-- TOC entry 6038 (class 0 OID 0)
-- Dependencies: 252
-- Name: form_4_streams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.form_4_streams_id_seq OWNED BY public.form_4_streams.id;


--
-- TOC entry 279 (class 1259 OID 59737)
-- Name: grading_end_term_1_form_1_2025; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grading_end_term_1_form_1_2025 (
    id integer NOT NULL,
    subject_id integer NOT NULL,
    e0 integer DEFAULT 0,
    e1 integer DEFAULT 29,
    dm0 integer DEFAULT 30,
    dm1 integer DEFAULT 34,
    d0 integer DEFAULT 35,
    d1 integer DEFAULT 39,
    dp0 integer DEFAULT 40,
    dp1 integer DEFAULT 44,
    cm0 integer DEFAULT 45,
    cm1 integer DEFAULT 49,
    c0 integer DEFAULT 50,
    c1 integer DEFAULT 54,
    cp0 integer DEFAULT 55,
    cp1 integer DEFAULT 59,
    bm0 integer DEFAULT 60,
    bm1 integer DEFAULT 64,
    b0 integer DEFAULT 65,
    b1 integer DEFAULT 69,
    bp0 integer DEFAULT 70,
    bp1 integer DEFAULT 74,
    am0 integer DEFAULT 75,
    am1 integer DEFAULT 79,
    a0 integer DEFAULT 80,
    a1 integer DEFAULT 100
);


ALTER TABLE public.grading_end_term_1_form_1_2025 OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 34714)
-- Name: grading_end_term_1_form_4_2025; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grading_end_term_1_form_4_2025 (
    id integer NOT NULL,
    subject_id integer NOT NULL,
    e0 integer DEFAULT 0,
    e1 integer DEFAULT 29,
    dm0 integer DEFAULT 30,
    dm1 integer DEFAULT 34,
    d0 integer DEFAULT 35,
    d1 integer DEFAULT 39,
    dp0 integer DEFAULT 40,
    dp1 integer DEFAULT 44,
    cm0 integer DEFAULT 45,
    cm1 integer DEFAULT 49,
    c0 integer DEFAULT 50,
    c1 integer DEFAULT 54,
    cp0 integer DEFAULT 55,
    cp1 integer DEFAULT 59,
    bm0 integer DEFAULT 60,
    bm1 integer DEFAULT 64,
    b0 integer DEFAULT 65,
    b1 integer DEFAULT 69,
    bp0 integer DEFAULT 70,
    bp1 integer DEFAULT 74,
    am0 integer DEFAULT 75,
    am1 integer DEFAULT 79,
    a0 integer DEFAULT 80,
    a1 integer DEFAULT 100
);


ALTER TABLE public.grading_end_term_1_form_4_2025 OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 59703)
-- Name: grading_mid_term_1_form_1_2025; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grading_mid_term_1_form_1_2025 (
    id integer NOT NULL,
    subject_id integer NOT NULL,
    e0 integer DEFAULT 0,
    e1 integer DEFAULT 29,
    dm0 integer DEFAULT 30,
    dm1 integer DEFAULT 34,
    d0 integer DEFAULT 35,
    d1 integer DEFAULT 39,
    dp0 integer DEFAULT 40,
    dp1 integer DEFAULT 44,
    cm0 integer DEFAULT 45,
    cm1 integer DEFAULT 49,
    c0 integer DEFAULT 50,
    c1 integer DEFAULT 54,
    cp0 integer DEFAULT 55,
    cp1 integer DEFAULT 59,
    bm0 integer DEFAULT 60,
    bm1 integer DEFAULT 64,
    b0 integer DEFAULT 65,
    b1 integer DEFAULT 69,
    bp0 integer DEFAULT 70,
    bp1 integer DEFAULT 74,
    am0 integer DEFAULT 75,
    am1 integer DEFAULT 79,
    a0 integer DEFAULT 80,
    a1 integer DEFAULT 100
);


ALTER TABLE public.grading_mid_term_1_form_1_2025 OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 34680)
-- Name: grading_mid_term_1_form_4_2025; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grading_mid_term_1_form_4_2025 (
    id integer NOT NULL,
    subject_id integer NOT NULL,
    e0 integer DEFAULT 0,
    e1 integer DEFAULT 29,
    dm0 integer DEFAULT 30,
    dm1 integer DEFAULT 34,
    d0 integer DEFAULT 35,
    d1 integer DEFAULT 39,
    dp0 integer DEFAULT 40,
    dp1 integer DEFAULT 44,
    cm0 integer DEFAULT 45,
    cm1 integer DEFAULT 49,
    c0 integer DEFAULT 50,
    c1 integer DEFAULT 54,
    cp0 integer DEFAULT 55,
    cp1 integer DEFAULT 59,
    bm0 integer DEFAULT 60,
    bm1 integer DEFAULT 64,
    b0 integer DEFAULT 65,
    b1 integer DEFAULT 69,
    bp0 integer DEFAULT 70,
    bp1 integer DEFAULT 74,
    am0 integer DEFAULT 75,
    am1 integer DEFAULT 79,
    a0 integer DEFAULT 80,
    a1 integer DEFAULT 100
);


ALTER TABLE public.grading_mid_term_1_form_4_2025 OWNER TO postgres;

--
-- TOC entry 277 (class 1259 OID 59669)
-- Name: grading_opener_term_1_form_1_2025; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grading_opener_term_1_form_1_2025 (
    id integer NOT NULL,
    subject_id integer NOT NULL,
    e0 integer DEFAULT 0,
    e1 integer DEFAULT 29,
    dm0 integer DEFAULT 30,
    dm1 integer DEFAULT 34,
    d0 integer DEFAULT 35,
    d1 integer DEFAULT 39,
    dp0 integer DEFAULT 40,
    dp1 integer DEFAULT 44,
    cm0 integer DEFAULT 45,
    cm1 integer DEFAULT 49,
    c0 integer DEFAULT 50,
    c1 integer DEFAULT 54,
    cp0 integer DEFAULT 55,
    cp1 integer DEFAULT 59,
    bm0 integer DEFAULT 60,
    bm1 integer DEFAULT 64,
    b0 integer DEFAULT 65,
    b1 integer DEFAULT 69,
    bp0 integer DEFAULT 70,
    bp1 integer DEFAULT 74,
    am0 integer DEFAULT 75,
    am1 integer DEFAULT 79,
    a0 integer DEFAULT 80,
    a1 integer DEFAULT 100
);


ALTER TABLE public.grading_opener_term_1_form_1_2025 OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 59409)
-- Name: mid_term_1_form_1_2025; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mid_term_1_form_1_2025 (
    id integer NOT NULL,
    "101" integer DEFAULT 0,
    "101_1" integer DEFAULT 0,
    "101_2" integer DEFAULT 0,
    "101_3" integer DEFAULT 0,
    "102" integer DEFAULT 0,
    "102_1" integer DEFAULT 0,
    "102_2" integer DEFAULT 0,
    "102_3" integer DEFAULT 0,
    "121" integer DEFAULT 0,
    "121_1" integer DEFAULT 0,
    "121_2" integer DEFAULT 0,
    "121_3" integer DEFAULT 0,
    "122" integer DEFAULT 0,
    "122_1" integer DEFAULT 0,
    "122_2" integer DEFAULT 0,
    "122_3" integer DEFAULT 0,
    "231" integer DEFAULT 0,
    "231_1" integer DEFAULT 0,
    "231_2" integer DEFAULT 0,
    "231_3" integer DEFAULT 0,
    "232" integer DEFAULT 0,
    "232_1" integer DEFAULT 0,
    "232_2" integer DEFAULT 0,
    "232_3" integer DEFAULT 0,
    "233" integer DEFAULT 0,
    "233_1" integer DEFAULT 0,
    "233_2" integer DEFAULT 0,
    "233_3" integer DEFAULT 0,
    "236" integer DEFAULT 0,
    "236_1" integer DEFAULT 0,
    "236_2" integer DEFAULT 0,
    "236_3" integer DEFAULT 0,
    "237" integer DEFAULT 0,
    "237_1" integer DEFAULT 0,
    "237_2" integer DEFAULT 0,
    "237_3" integer DEFAULT 0,
    "311" integer DEFAULT 0,
    "311_1" integer DEFAULT 0,
    "311_2" integer DEFAULT 0,
    "311_3" integer DEFAULT 0,
    "312" integer DEFAULT 0,
    "312_1" integer DEFAULT 0,
    "312_2" integer DEFAULT 0,
    "312_3" integer DEFAULT 0,
    "313" integer DEFAULT 0,
    "313_1" integer DEFAULT 0,
    "313_2" integer DEFAULT 0,
    "313_3" integer DEFAULT 0,
    "314" integer DEFAULT 0,
    "314_1" integer DEFAULT 0,
    "314_2" integer DEFAULT 0,
    "314_3" integer DEFAULT 0,
    "315" integer DEFAULT 0,
    "315_1" integer DEFAULT 0,
    "315_2" integer DEFAULT 0,
    "315_3" integer DEFAULT 0,
    "441" integer DEFAULT 0,
    "441_1" integer DEFAULT 0,
    "441_2" integer DEFAULT 0,
    "441_3" integer DEFAULT 0,
    "442" integer DEFAULT 0,
    "442_1" integer DEFAULT 0,
    "442_2" integer DEFAULT 0,
    "442_3" integer DEFAULT 0,
    "443" integer DEFAULT 0,
    "443_1" integer DEFAULT 0,
    "443_2" integer DEFAULT 0,
    "443_3" integer DEFAULT 0,
    "444" integer DEFAULT 0,
    "444_1" integer DEFAULT 0,
    "444_2" integer DEFAULT 0,
    "444_3" integer DEFAULT 0,
    "445" integer DEFAULT 0,
    "445_1" integer DEFAULT 0,
    "445_2" integer DEFAULT 0,
    "445_3" integer DEFAULT 0,
    "446" integer DEFAULT 0,
    "446_1" integer DEFAULT 0,
    "446_2" integer DEFAULT 0,
    "446_3" integer DEFAULT 0,
    "447" integer DEFAULT 0,
    "447_1" integer DEFAULT 0,
    "447_2" integer DEFAULT 0,
    "447_3" integer DEFAULT 0,
    "448" integer DEFAULT 0,
    "448_1" integer DEFAULT 0,
    "448_2" integer DEFAULT 0,
    "448_3" integer DEFAULT 0,
    "449" integer DEFAULT 0,
    "449_1" integer DEFAULT 0,
    "449_2" integer DEFAULT 0,
    "449_3" integer DEFAULT 0,
    "450" integer DEFAULT 0,
    "450_1" integer DEFAULT 0,
    "450_2" integer DEFAULT 0,
    "450_3" integer DEFAULT 0,
    "451" integer DEFAULT 0,
    "451_1" integer DEFAULT 0,
    "451_2" integer DEFAULT 0,
    "451_3" integer DEFAULT 0,
    "501" integer DEFAULT 0,
    "501_1" integer DEFAULT 0,
    "501_2" integer DEFAULT 0,
    "501_3" integer DEFAULT 0,
    "502" integer DEFAULT 0,
    "502_1" integer DEFAULT 0,
    "502_2" integer DEFAULT 0,
    "502_3" integer DEFAULT 0,
    "503" integer DEFAULT 0,
    "503_1" integer DEFAULT 0,
    "503_2" integer DEFAULT 0,
    "503_3" integer DEFAULT 0,
    "511" integer DEFAULT 0,
    "511_1" integer DEFAULT 0,
    "511_2" integer DEFAULT 0,
    "511_3" integer DEFAULT 0,
    "565" integer DEFAULT 0,
    "565_1" integer DEFAULT 0,
    "565_2" integer DEFAULT 0,
    "565_3" integer DEFAULT 0
);


ALTER TABLE public.mid_term_1_form_1_2025 OWNER TO postgres;

--
-- TOC entry 281 (class 1259 OID 59783)
-- Name: mid_term_1_form_1_2025_paper_setup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mid_term_1_form_1_2025_paper_setup (
    id integer NOT NULL,
    papers integer DEFAULT 3 NOT NULL,
    formula character varying(55) DEFAULT 'twoPaperAvg'::character varying NOT NULL
);


ALTER TABLE public.mid_term_1_form_1_2025_paper_setup OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 34420)
-- Name: mid_term_1_form_4_2025; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mid_term_1_form_4_2025 (
    id integer NOT NULL,
    "101" integer DEFAULT 0,
    "101_1" integer DEFAULT 0,
    "101_2" integer DEFAULT 0,
    "101_3" integer DEFAULT 0,
    "102" integer DEFAULT 0,
    "102_1" integer DEFAULT 0,
    "102_2" integer DEFAULT 0,
    "102_3" integer DEFAULT 0,
    "121" integer DEFAULT 0,
    "121_1" integer DEFAULT 0,
    "121_2" integer DEFAULT 0,
    "121_3" integer DEFAULT 0,
    "122" integer DEFAULT 0,
    "122_1" integer DEFAULT 0,
    "122_2" integer DEFAULT 0,
    "122_3" integer DEFAULT 0,
    "231" integer DEFAULT 0,
    "231_1" integer DEFAULT 0,
    "231_2" integer DEFAULT 0,
    "231_3" integer DEFAULT 0,
    "232" integer DEFAULT 0,
    "232_1" integer DEFAULT 0,
    "232_2" integer DEFAULT 0,
    "232_3" integer DEFAULT 0,
    "233" integer DEFAULT 0,
    "233_1" integer DEFAULT 0,
    "233_2" integer DEFAULT 0,
    "233_3" integer DEFAULT 0,
    "236" integer DEFAULT 0,
    "236_1" integer DEFAULT 0,
    "236_2" integer DEFAULT 0,
    "236_3" integer DEFAULT 0,
    "237" integer DEFAULT 0,
    "237_1" integer DEFAULT 0,
    "237_2" integer DEFAULT 0,
    "237_3" integer DEFAULT 0,
    "311" integer DEFAULT 0,
    "311_1" integer DEFAULT 0,
    "311_2" integer DEFAULT 0,
    "311_3" integer DEFAULT 0,
    "312" integer DEFAULT 0,
    "312_1" integer DEFAULT 0,
    "312_2" integer DEFAULT 0,
    "312_3" integer DEFAULT 0,
    "313" integer DEFAULT 0,
    "313_1" integer DEFAULT 0,
    "313_2" integer DEFAULT 0,
    "313_3" integer DEFAULT 0,
    "314" integer DEFAULT 0,
    "314_1" integer DEFAULT 0,
    "314_2" integer DEFAULT 0,
    "314_3" integer DEFAULT 0,
    "315" integer DEFAULT 0,
    "315_1" integer DEFAULT 0,
    "315_2" integer DEFAULT 0,
    "315_3" integer DEFAULT 0,
    "441" integer DEFAULT 0,
    "441_1" integer DEFAULT 0,
    "441_2" integer DEFAULT 0,
    "441_3" integer DEFAULT 0,
    "442" integer DEFAULT 0,
    "442_1" integer DEFAULT 0,
    "442_2" integer DEFAULT 0,
    "442_3" integer DEFAULT 0,
    "443" integer DEFAULT 0,
    "443_1" integer DEFAULT 0,
    "443_2" integer DEFAULT 0,
    "443_3" integer DEFAULT 0,
    "444" integer DEFAULT 0,
    "444_1" integer DEFAULT 0,
    "444_2" integer DEFAULT 0,
    "444_3" integer DEFAULT 0,
    "445" integer DEFAULT 0,
    "445_1" integer DEFAULT 0,
    "445_2" integer DEFAULT 0,
    "445_3" integer DEFAULT 0,
    "446" integer DEFAULT 0,
    "446_1" integer DEFAULT 0,
    "446_2" integer DEFAULT 0,
    "446_3" integer DEFAULT 0,
    "447" integer DEFAULT 0,
    "447_1" integer DEFAULT 0,
    "447_2" integer DEFAULT 0,
    "447_3" integer DEFAULT 0,
    "448" integer DEFAULT 0,
    "448_1" integer DEFAULT 0,
    "448_2" integer DEFAULT 0,
    "448_3" integer DEFAULT 0,
    "449" integer DEFAULT 0,
    "449_1" integer DEFAULT 0,
    "449_2" integer DEFAULT 0,
    "449_3" integer DEFAULT 0,
    "450" integer DEFAULT 0,
    "450_1" integer DEFAULT 0,
    "450_2" integer DEFAULT 0,
    "450_3" integer DEFAULT 0,
    "451" integer DEFAULT 0,
    "451_1" integer DEFAULT 0,
    "451_2" integer DEFAULT 0,
    "451_3" integer DEFAULT 0,
    "501" integer DEFAULT 0,
    "501_1" integer DEFAULT 0,
    "501_2" integer DEFAULT 0,
    "501_3" integer DEFAULT 0,
    "502" integer DEFAULT 0,
    "502_1" integer DEFAULT 0,
    "502_2" integer DEFAULT 0,
    "502_3" integer DEFAULT 0,
    "503" integer DEFAULT 0,
    "503_1" integer DEFAULT 0,
    "503_2" integer DEFAULT 0,
    "503_3" integer DEFAULT 0,
    "511" integer DEFAULT 0,
    "511_1" integer DEFAULT 0,
    "511_2" integer DEFAULT 0,
    "511_3" integer DEFAULT 0,
    "565" integer DEFAULT 0,
    "565_1" integer DEFAULT 0,
    "565_2" integer DEFAULT 0,
    "565_3" integer DEFAULT 0
);


ALTER TABLE public.mid_term_1_form_4_2025 OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 34748)
-- Name: mid_term_1_form_4_2025_paper_setup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mid_term_1_form_4_2025_paper_setup (
    id integer NOT NULL,
    papers integer DEFAULT 3 NOT NULL,
    formula character varying(55) DEFAULT 'twoPaperAvg'::character varying NOT NULL,
    paper_1 integer DEFAULT 100 NOT NULL,
    paper_2 integer DEFAULT 100 NOT NULL,
    paper_3 integer DEFAULT 100 NOT NULL
);


ALTER TABLE public.mid_term_1_form_4_2025_paper_setup OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 59279)
-- Name: opener_term_1_form_1_2025; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.opener_term_1_form_1_2025 (
    id integer NOT NULL,
    "101" integer DEFAULT 0,
    "101_1" integer DEFAULT 0,
    "101_2" integer DEFAULT 0,
    "101_3" integer DEFAULT 0,
    "102" integer DEFAULT 0,
    "102_1" integer DEFAULT 0,
    "102_2" integer DEFAULT 0,
    "102_3" integer DEFAULT 0,
    "121" integer DEFAULT 0,
    "121_1" integer DEFAULT 0,
    "121_2" integer DEFAULT 0,
    "121_3" integer DEFAULT 0,
    "122" integer DEFAULT 0,
    "122_1" integer DEFAULT 0,
    "122_2" integer DEFAULT 0,
    "122_3" integer DEFAULT 0,
    "231" integer DEFAULT 0,
    "231_1" integer DEFAULT 0,
    "231_2" integer DEFAULT 0,
    "231_3" integer DEFAULT 0,
    "232" integer DEFAULT 0,
    "232_1" integer DEFAULT 0,
    "232_2" integer DEFAULT 0,
    "232_3" integer DEFAULT 0,
    "233" integer DEFAULT 0,
    "233_1" integer DEFAULT 0,
    "233_2" integer DEFAULT 0,
    "233_3" integer DEFAULT 0,
    "236" integer DEFAULT 0,
    "236_1" integer DEFAULT 0,
    "236_2" integer DEFAULT 0,
    "236_3" integer DEFAULT 0,
    "237" integer DEFAULT 0,
    "237_1" integer DEFAULT 0,
    "237_2" integer DEFAULT 0,
    "237_3" integer DEFAULT 0,
    "311" integer DEFAULT 0,
    "311_1" integer DEFAULT 0,
    "311_2" integer DEFAULT 0,
    "311_3" integer DEFAULT 0,
    "312" integer DEFAULT 0,
    "312_1" integer DEFAULT 0,
    "312_2" integer DEFAULT 0,
    "312_3" integer DEFAULT 0,
    "313" integer DEFAULT 0,
    "313_1" integer DEFAULT 0,
    "313_2" integer DEFAULT 0,
    "313_3" integer DEFAULT 0,
    "314" integer DEFAULT 0,
    "314_1" integer DEFAULT 0,
    "314_2" integer DEFAULT 0,
    "314_3" integer DEFAULT 0,
    "315" integer DEFAULT 0,
    "315_1" integer DEFAULT 0,
    "315_2" integer DEFAULT 0,
    "315_3" integer DEFAULT 0,
    "441" integer DEFAULT 0,
    "441_1" integer DEFAULT 0,
    "441_2" integer DEFAULT 0,
    "441_3" integer DEFAULT 0,
    "442" integer DEFAULT 0,
    "442_1" integer DEFAULT 0,
    "442_2" integer DEFAULT 0,
    "442_3" integer DEFAULT 0,
    "443" integer DEFAULT 0,
    "443_1" integer DEFAULT 0,
    "443_2" integer DEFAULT 0,
    "443_3" integer DEFAULT 0,
    "444" integer DEFAULT 0,
    "444_1" integer DEFAULT 0,
    "444_2" integer DEFAULT 0,
    "444_3" integer DEFAULT 0,
    "445" integer DEFAULT 0,
    "445_1" integer DEFAULT 0,
    "445_2" integer DEFAULT 0,
    "445_3" integer DEFAULT 0,
    "446" integer DEFAULT 0,
    "446_1" integer DEFAULT 0,
    "446_2" integer DEFAULT 0,
    "446_3" integer DEFAULT 0,
    "447" integer DEFAULT 0,
    "447_1" integer DEFAULT 0,
    "447_2" integer DEFAULT 0,
    "447_3" integer DEFAULT 0,
    "448" integer DEFAULT 0,
    "448_1" integer DEFAULT 0,
    "448_2" integer DEFAULT 0,
    "448_3" integer DEFAULT 0,
    "449" integer DEFAULT 0,
    "449_1" integer DEFAULT 0,
    "449_2" integer DEFAULT 0,
    "449_3" integer DEFAULT 0,
    "450" integer DEFAULT 0,
    "450_1" integer DEFAULT 0,
    "450_2" integer DEFAULT 0,
    "450_3" integer DEFAULT 0,
    "451" integer DEFAULT 0,
    "451_1" integer DEFAULT 0,
    "451_2" integer DEFAULT 0,
    "451_3" integer DEFAULT 0,
    "501" integer DEFAULT 0,
    "501_1" integer DEFAULT 0,
    "501_2" integer DEFAULT 0,
    "501_3" integer DEFAULT 0,
    "502" integer DEFAULT 0,
    "502_1" integer DEFAULT 0,
    "502_2" integer DEFAULT 0,
    "502_3" integer DEFAULT 0,
    "503" integer DEFAULT 0,
    "503_1" integer DEFAULT 0,
    "503_2" integer DEFAULT 0,
    "503_3" integer DEFAULT 0,
    "511" integer DEFAULT 0,
    "511_1" integer DEFAULT 0,
    "511_2" integer DEFAULT 0,
    "511_3" integer DEFAULT 0,
    "565" integer DEFAULT 0,
    "565_1" integer DEFAULT 0,
    "565_2" integer DEFAULT 0,
    "565_3" integer DEFAULT 0
);


ALTER TABLE public.opener_term_1_form_1_2025 OWNER TO postgres;

--
-- TOC entry 280 (class 1259 OID 59771)
-- Name: opener_term_1_form_1_2025_paper_setup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.opener_term_1_form_1_2025_paper_setup (
    id integer NOT NULL,
    papers integer DEFAULT 3 NOT NULL,
    formula character varying(55) DEFAULT 'twoPaperAvg'::character varying NOT NULL
);


ALTER TABLE public.opener_term_1_form_1_2025_paper_setup OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 49839)
-- Name: particulars; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.particulars (
    id integer NOT NULL,
    schoolname character varying(255) NOT NULL,
    motto character varying(255) NOT NULL,
    phone bigint NOT NULL,
    address text NOT NULL,
    email character varying(255) NOT NULL,
    website character varying(255),
    logo_path text,
    file_hash text
);


ALTER TABLE public.particulars OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 41906)
-- Name: principal_remark; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.principal_remark (
    id integer NOT NULL,
    comment text NOT NULL
);


ALTER TABLE public.principal_remark OWNER TO postgres;

--
-- TOC entry 284 (class 1259 OID 59840)
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    token_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    token character varying(255) NOT NULL,
    user_agent text,
    ip_address character varying(45),
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    revoked_at timestamp with time zone
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- TOC entry 285 (class 1259 OID 59854)
-- Name: revoked_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.revoked_tokens (
    token_id character varying(36) NOT NULL,
    user_id uuid,
    expires_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.revoked_tokens OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 49928)
-- Name: smslogs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.smslogs (
    id integer NOT NULL,
    student_id integer NOT NULL,
    phone bigint NOT NULL,
    message_id bigint NOT NULL,
    response_code integer NOT NULL,
    description character varying(255) NOT NULL,
    "timestamp" character varying(255) NOT NULL,
    unival character varying(255) NOT NULL,
    student_unival character varying(255) NOT NULL
);


ALTER TABLE public.smslogs OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 49927)
-- Name: smslogs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.smslogs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.smslogs_id_seq OWNER TO postgres;

--
-- TOC entry 6039 (class 0 OID 0)
-- Dependencies: 264
-- Name: smslogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.smslogs_id_seq OWNED BY public.smslogs.id;


--
-- TOC entry 243 (class 1259 OID 41658)
-- Name: staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff (
    id integer NOT NULL,
    title character varying(10) NOT NULL,
    fname character varying(55) NOT NULL,
    mname character varying(55) NOT NULL,
    lname character varying(55) NOT NULL,
    sex character(1) NOT NULL,
    year character varying(10) NOT NULL,
    phone bigint NOT NULL,
    email character varying(225),
    image character varying(225)
);


ALTER TABLE public.staff OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 58044)
-- Name: staff_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_images (
    id integer NOT NULL,
    filename text,
    path text,
    folder text,
    file_hash text,
    uploaded_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.staff_images OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 58077)
-- Name: streams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.streams (
    id integer NOT NULL,
    stream_name text NOT NULL
);


ALTER TABLE public.streams OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 58076)
-- Name: streams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.streams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.streams_id_seq OWNER TO postgres;

--
-- TOC entry 6040 (class 0 OID 0)
-- Dependencies: 269
-- Name: streams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.streams_id_seq OWNED BY public.streams.id;


--
-- TOC entry 273 (class 1259 OID 58662)
-- Name: student_form_1_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_form_1_images (
    id integer NOT NULL,
    year integer NOT NULL,
    filename text,
    path text,
    folder text,
    file_hash text,
    uploaded_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.student_form_1_images OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 58086)
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    uid integer NOT NULL,
    id character varying(20) NOT NULL,
    upi_number character varying(20),
    fname text NOT NULL,
    mname text NOT NULL,
    lname text NOT NULL,
    gender character(1),
    dob date,
    kcpe_marks integer NOT NULL,
    phone bigint NOT NULL,
    year_of_enrolment integer NOT NULL,
    current_form integer,
    current_year integer NOT NULL,
    stream_id integer,
    status character varying(20) DEFAULT 'Active'::character varying,
    address text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT students_current_form_check CHECK (((current_form >= 1) AND (current_form <= 4))),
    CONSTRAINT students_gender_check CHECK ((gender = ANY (ARRAY['M'::bpchar, 'F'::bpchar]))),
    CONSTRAINT students_status_check CHECK (((status)::text = ANY ((ARRAY['Active'::character varying, 'Transferred'::character varying, 'Graduated'::character varying, 'Dropped'::character varying])::text[])))
);


ALTER TABLE public.students OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 25023)
-- Name: students_form_1; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students_form_1 (
    id integer NOT NULL,
    fname character varying(255) NOT NULL,
    mname character varying(255) NOT NULL,
    lname character varying(255) NOT NULL,
    sex character(1) NOT NULL,
    dob date NOT NULL,
    stream_id integer,
    kcpe_marks integer NOT NULL,
    year character varying(55) NOT NULL,
    phone bigint NOT NULL,
    address text
);


ALTER TABLE public.students_form_1 OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 25071)
-- Name: students_form_2; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students_form_2 (
    id integer NOT NULL,
    fname character varying(255) NOT NULL,
    mname character varying(255) NOT NULL,
    lname character varying(255) NOT NULL,
    sex character(1) NOT NULL,
    dob date NOT NULL,
    stream_id integer,
    kcpe_marks integer NOT NULL,
    year character varying(55) NOT NULL,
    phone bigint NOT NULL,
    address text
);


ALTER TABLE public.students_form_2 OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 25083)
-- Name: students_form_3; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students_form_3 (
    id integer NOT NULL,
    fname character varying(255) NOT NULL,
    mname character varying(255) NOT NULL,
    lname character varying(255) NOT NULL,
    sex character(1) NOT NULL,
    dob date NOT NULL,
    stream_id integer,
    kcpe_marks integer NOT NULL,
    year character varying(55) NOT NULL,
    phone bigint NOT NULL,
    address text
);


ALTER TABLE public.students_form_3 OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 25095)
-- Name: students_form_4; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students_form_4 (
    id integer NOT NULL,
    fname character varying(255) NOT NULL,
    mname character varying(255) NOT NULL,
    lname character varying(255) NOT NULL,
    sex character(1) NOT NULL,
    dob date NOT NULL,
    stream_id integer,
    kcpe_marks integer NOT NULL,
    year character varying(55) NOT NULL,
    phone bigint NOT NULL,
    address text
);


ALTER TABLE public.students_form_4 OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 58085)
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.students_id_seq OWNER TO postgres;

--
-- TOC entry 6041 (class 0 OID 0)
-- Dependencies: 271
-- Name: students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.students_id_seq OWNED BY public.students.uid;


--
-- TOC entry 221 (class 1259 OID 24812)
-- Name: subjects_form_1; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjects_form_1 (
    id integer NOT NULL,
    name character varying(55) NOT NULL,
    init character varying(5) NOT NULL,
    status integer NOT NULL
);


ALTER TABLE public.subjects_form_1 OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 24817)
-- Name: subjects_form_2; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjects_form_2 (
    id integer NOT NULL,
    name character varying(55) NOT NULL,
    init character varying(5) NOT NULL,
    status integer NOT NULL
);


ALTER TABLE public.subjects_form_2 OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 24822)
-- Name: subjects_form_3; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjects_form_3 (
    id integer NOT NULL,
    name character varying(55) NOT NULL,
    init character varying(5) NOT NULL,
    status integer NOT NULL
);


ALTER TABLE public.subjects_form_3 OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 24827)
-- Name: subjects_form_4; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjects_form_4 (
    id integer NOT NULL,
    name character varying(55) NOT NULL,
    init character varying(5) NOT NULL,
    status integer NOT NULL
);


ALTER TABLE public.subjects_form_4 OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 41670)
-- Name: subjectteachers_form_1; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjectteachers_form_1 (
    id integer NOT NULL,
    stream_id integer NOT NULL,
    teacher_id integer NOT NULL,
    subject_id integer NOT NULL,
    year character varying(10) NOT NULL,
    unival character varying(255) NOT NULL
);


ALTER TABLE public.subjectteachers_form_1 OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 41669)
-- Name: subjectteachers_form_1_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subjectteachers_form_1_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subjectteachers_form_1_id_seq OWNER TO postgres;

--
-- TOC entry 6042 (class 0 OID 0)
-- Dependencies: 244
-- Name: subjectteachers_form_1_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subjectteachers_form_1_id_seq OWNED BY public.subjectteachers_form_1.id;


--
-- TOC entry 259 (class 1259 OID 49847)
-- Name: subjectteachers_form_2; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjectteachers_form_2 (
    id integer NOT NULL,
    stream_id integer NOT NULL,
    teacher_id integer NOT NULL,
    subject_id integer NOT NULL,
    year character varying(10) NOT NULL,
    unival character varying(255) NOT NULL
);


ALTER TABLE public.subjectteachers_form_2 OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 49846)
-- Name: subjectteachers_form_2_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subjectteachers_form_2_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subjectteachers_form_2_id_seq OWNER TO postgres;

--
-- TOC entry 6043 (class 0 OID 0)
-- Dependencies: 258
-- Name: subjectteachers_form_2_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subjectteachers_form_2_id_seq OWNED BY public.subjectteachers_form_2.id;


--
-- TOC entry 261 (class 1259 OID 49866)
-- Name: subjectteachers_form_3; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjectteachers_form_3 (
    id integer NOT NULL,
    stream_id integer NOT NULL,
    teacher_id integer NOT NULL,
    subject_id integer NOT NULL,
    year character varying(10) NOT NULL,
    unival character varying(255) NOT NULL
);


ALTER TABLE public.subjectteachers_form_3 OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 49865)
-- Name: subjectteachers_form_3_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subjectteachers_form_3_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subjectteachers_form_3_id_seq OWNER TO postgres;

--
-- TOC entry 6044 (class 0 OID 0)
-- Dependencies: 260
-- Name: subjectteachers_form_3_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subjectteachers_form_3_id_seq OWNED BY public.subjectteachers_form_3.id;


--
-- TOC entry 263 (class 1259 OID 49885)
-- Name: subjectteachers_form_4; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjectteachers_form_4 (
    id integer NOT NULL,
    stream_id integer NOT NULL,
    teacher_id integer NOT NULL,
    subject_id integer NOT NULL,
    year character varying(10) NOT NULL,
    unival character varying(255) NOT NULL
);


ALTER TABLE public.subjectteachers_form_4 OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 49884)
-- Name: subjectteachers_form_4_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subjectteachers_form_4_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subjectteachers_form_4_id_seq OWNER TO postgres;

--
-- TOC entry 6045 (class 0 OID 0)
-- Dependencies: 262
-- Name: subjectteachers_form_4_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subjectteachers_form_4_id_seq OWNED BY public.subjectteachers_form_4.id;


--
-- TOC entry 267 (class 1259 OID 58027)
-- Name: uploaded_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.uploaded_images (
    id integer NOT NULL,
    filename text,
    path text,
    folder text,
    file_hash text,
    uploaded_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.uploaded_images OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 58026)
-- Name: uploaded_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.uploaded_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.uploaded_images_id_seq OWNER TO postgres;

--
-- TOC entry 6046 (class 0 OID 0)
-- Dependencies: 266
-- Name: uploaded_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.uploaded_images_id_seq OWNED BY public.uploaded_images.id;


--
-- TOC entry 283 (class 1259 OID 59826)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    is_active boolean DEFAULT true,
    token_version uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 4865 (class 2604 OID 16410)
-- Name: auth id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth ALTER COLUMN id SET DEFAULT nextval('public.auth_id_seq'::regclass);


--
-- TOC entry 4867 (class 2604 OID 33452)
-- Name: form_1_exams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_1_exams ALTER COLUMN id SET DEFAULT nextval('public.form_1_exams_id_seq'::regclass);


--
-- TOC entry 5171 (class 2604 OID 41842)
-- Name: form_1_streams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_1_streams ALTER COLUMN id SET DEFAULT nextval('public.form_1_streams_id_seq'::regclass);


--
-- TOC entry 4869 (class 2604 OID 33462)
-- Name: form_2_exams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_2_exams ALTER COLUMN id SET DEFAULT nextval('public.form_2_exams_id_seq'::regclass);


--
-- TOC entry 5173 (class 2604 OID 41858)
-- Name: form_2_streams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_2_streams ALTER COLUMN id SET DEFAULT nextval('public.form_2_streams_id_seq'::regclass);


--
-- TOC entry 4871 (class 2604 OID 33472)
-- Name: form_3_exams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_3_exams ALTER COLUMN id SET DEFAULT nextval('public.form_3_exams_id_seq'::regclass);


--
-- TOC entry 5175 (class 2604 OID 41873)
-- Name: form_3_streams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_3_streams ALTER COLUMN id SET DEFAULT nextval('public.form_3_streams_id_seq'::regclass);


--
-- TOC entry 4873 (class 2604 OID 33482)
-- Name: form_4_exams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_4_exams ALTER COLUMN id SET DEFAULT nextval('public.form_4_exams_id_seq'::regclass);


--
-- TOC entry 5177 (class 2604 OID 41888)
-- Name: form_4_streams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_4_streams ALTER COLUMN id SET DEFAULT nextval('public.form_4_streams_id_seq'::regclass);


--
-- TOC entry 5182 (class 2604 OID 49931)
-- Name: smslogs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.smslogs ALTER COLUMN id SET DEFAULT nextval('public.smslogs_id_seq'::regclass);


--
-- TOC entry 5186 (class 2604 OID 58080)
-- Name: streams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.streams ALTER COLUMN id SET DEFAULT nextval('public.streams_id_seq'::regclass);


--
-- TOC entry 5187 (class 2604 OID 58089)
-- Name: students uid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students ALTER COLUMN uid SET DEFAULT nextval('public.students_id_seq'::regclass);


--
-- TOC entry 5170 (class 2604 OID 41673)
-- Name: subjectteachers_form_1 id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjectteachers_form_1 ALTER COLUMN id SET DEFAULT nextval('public.subjectteachers_form_1_id_seq'::regclass);


--
-- TOC entry 5179 (class 2604 OID 49850)
-- Name: subjectteachers_form_2 id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjectteachers_form_2 ALTER COLUMN id SET DEFAULT nextval('public.subjectteachers_form_2_id_seq'::regclass);


--
-- TOC entry 5180 (class 2604 OID 49869)
-- Name: subjectteachers_form_3 id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjectteachers_form_3 ALTER COLUMN id SET DEFAULT nextval('public.subjectteachers_form_3_id_seq'::regclass);


--
-- TOC entry 5181 (class 2604 OID 49888)
-- Name: subjectteachers_form_4 id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjectteachers_form_4 ALTER COLUMN id SET DEFAULT nextval('public.subjectteachers_form_4_id_seq'::regclass);


--
-- TOC entry 5183 (class 2604 OID 58030)
-- Name: uploaded_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uploaded_images ALTER COLUMN id SET DEFAULT nextval('public.uploaded_images_id_seq'::regclass);


--
-- TOC entry 5958 (class 0 OID 16407)
-- Dependencies: 220
-- Data for Name: auth; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth (id, username, password, is_active, token_version) FROM stdin;
1	Kimaru	$2b$10$JUaiENURXq.ZVbdTZ0O29OWTK8sZd7vtqDI.849oSsEDfDizr1aya	t	\N
3	kim	$2b$10$68MM74F.cidwkooTlmEa9egwKe7BicQ1xIIpQzvMt8ujkwtAIlBqu	t	\N
4	bogonko	$2b$10$zDb9gRiFeFZ4XN22Lc.6CO.OPWf5LQ1B0WPZh5f8A3NSskKDQdgN6	t	\N
5	bog	$2b$10$y6QfXfUVxRNW29hloS./5ulW/9p5whjNYVY5blIyt01eLgr/y6lK.	t	\N
6	bogs	$2b$10$ybS72NbtzojddCoj0gu5dO.3dsbDNrssxVQibHtV3truO8rbKFV/m	t	\N
\.


--
-- TOC entry 5994 (class 0 OID 41913)
-- Dependencies: 256
-- Data for Name: classteacher_remark; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.classteacher_remark (id, comment) FROM stdin;
12	Outstanding Performance. Keep up the excellent work.
11	Very impressive results. You are almost at the top.
10	Great Achievement. A little more effort will take you even higher.
9	A Strong Performance. Focus on consistency to reach the top.
8	Good Work. Aim to refine your skills and reach your full potential.
7	Fair Effort. With more dedication, you can achieve even greater success.
6	Average Performance. Identify your weak areas and work on them.
5	Below Average. Put in more effort to improve your results.
4	Struggling. Consistency practice and seeking help will make a big difference.
3	Below Expectations. Serious improvement is necessary - do not give up.
1	Extremely Low Performance. Serious improvement is necessary - do not give up.
2	Poor Performance. Serious improvement is necessary - do not give up.
\.


--
-- TOC entry 5992 (class 0 OID 41899)
-- Dependencies: 254
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, comment) FROM stdin;
10	Great Achievement
8	Good Work
7	Fair Effort
6	Average Performance
5	Below Average
4	Struggling
3	Below Expectations
2	Low Performance
1	Extremely Low Performance
9	A Strong Results
12	Outstanding Result
11	Very impressive results
\.


--
-- TOC entry 6014 (class 0 OID 59539)
-- Dependencies: 276
-- Data for Name: end_term_1_form_1_2025; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.end_term_1_form_1_2025 (id, "101", "101_1", "101_2", "101_3", "102", "102_1", "102_2", "102_3", "121", "121_1", "121_2", "121_3", "122", "122_1", "122_2", "122_3", "231", "231_1", "231_2", "231_3", "232", "232_1", "232_2", "232_3", "233", "233_1", "233_2", "233_3", "236", "236_1", "236_2", "236_3", "237", "237_1", "237_2", "237_3", "311", "311_1", "311_2", "311_3", "312", "312_1", "312_2", "312_3", "313", "313_1", "313_2", "313_3", "314", "314_1", "314_2", "314_3", "315", "315_1", "315_2", "315_3", "441", "441_1", "441_2", "441_3", "442", "442_1", "442_2", "442_3", "443", "443_1", "443_2", "443_3", "444", "444_1", "444_2", "444_3", "445", "445_1", "445_2", "445_3", "446", "446_1", "446_2", "446_3", "447", "447_1", "447_2", "447_3", "448", "448_1", "448_2", "448_3", "449", "449_1", "449_2", "449_3", "450", "450_1", "450_2", "450_3", "451", "451_1", "451_2", "451_3", "501", "501_1", "501_2", "501_3", "502", "502_1", "502_2", "502_3", "503", "503_1", "503_2", "503_3", "511", "511_1", "511_2", "511_3", "565", "565_1", "565_2", "565_3") FROM stdin;
4520	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
12789	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
23427	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
34098	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
34634	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
45361	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
45734	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
45891	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
\.


--
-- TOC entry 6020 (class 0 OID 59795)
-- Dependencies: 282
-- Data for Name: end_term_1_form_1_2025_paper_setup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.end_term_1_form_1_2025_paper_setup (id, papers, formula) FROM stdin;
101	3	twoPaperAvg
102	3	twoPaperAvg
121	3	twoPaperAvg
122	3	twoPaperAvg
231	3	twoPaperAvg
232	3	twoPaperAvg
233	3	twoPaperAvg
236	3	twoPaperAvg
237	3	twoPaperAvg
311	3	twoPaperAvg
312	3	twoPaperAvg
313	3	twoPaperAvg
314	3	twoPaperAvg
315	3	twoPaperAvg
441	3	twoPaperAvg
442	3	twoPaperAvg
443	3	twoPaperAvg
444	3	twoPaperAvg
445	3	twoPaperAvg
446	3	twoPaperAvg
447	3	twoPaperAvg
448	3	twoPaperAvg
449	3	twoPaperAvg
450	3	twoPaperAvg
451	3	twoPaperAvg
501	3	twoPaperAvg
502	3	twoPaperAvg
503	3	twoPaperAvg
511	3	twoPaperAvg
565	3	twoPaperAvg
\.


--
-- TOC entry 5976 (class 0 OID 34550)
-- Dependencies: 238
-- Data for Name: end_term_1_form_4_2025; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.end_term_1_form_4_2025 (id, "101", "101_1", "101_2", "101_3", "102", "102_1", "102_2", "102_3", "121", "121_1", "121_2", "121_3", "122", "122_1", "122_2", "122_3", "231", "231_1", "231_2", "231_3", "232", "232_1", "232_2", "232_3", "233", "233_1", "233_2", "233_3", "236", "236_1", "236_2", "236_3", "237", "237_1", "237_2", "237_3", "311", "311_1", "311_2", "311_3", "312", "312_1", "312_2", "312_3", "313", "313_1", "313_2", "313_3", "314", "314_1", "314_2", "314_3", "315", "315_1", "315_2", "315_3", "441", "441_1", "441_2", "441_3", "442", "442_1", "442_2", "442_3", "443", "443_1", "443_2", "443_3", "444", "444_1", "444_2", "444_3", "445", "445_1", "445_2", "445_3", "446", "446_1", "446_2", "446_3", "447", "447_1", "447_2", "447_3", "448", "448_1", "448_2", "448_3", "449", "449_1", "449_2", "449_3", "450", "450_1", "450_2", "450_3", "451", "451_1", "451_2", "451_3", "501", "501_1", "501_2", "501_3", "502", "502_1", "502_2", "502_3", "503", "503_1", "503_2", "503_3", "511", "511_1", "511_2", "511_3", "565", "565_1", "565_2", "565_3") FROM stdin;
12451	59	50	67	90	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
12459	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
35742	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
78972	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
96545	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
\.


--
-- TOC entry 5980 (class 0 OID 34760)
-- Dependencies: 242
-- Data for Name: end_term_1_form_4_2025_paper_setup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.end_term_1_form_4_2025_paper_setup (id, papers, formula) FROM stdin;
101	3	twoPaperAvg
102	3	twoPaperAvg
121	3	twoPaperAvg
122	3	twoPaperAvg
231	3	twoPaperAvg
232	3	twoPaperAvg
233	3	twoPaperAvg
236	3	twoPaperAvg
237	3	twoPaperAvg
311	3	twoPaperAvg
312	3	twoPaperAvg
313	3	twoPaperAvg
314	3	twoPaperAvg
315	3	twoPaperAvg
441	3	twoPaperAvg
442	3	twoPaperAvg
443	3	twoPaperAvg
444	3	twoPaperAvg
445	3	twoPaperAvg
446	3	twoPaperAvg
447	3	twoPaperAvg
448	3	twoPaperAvg
449	3	twoPaperAvg
450	3	twoPaperAvg
451	3	twoPaperAvg
501	3	twoPaperAvg
502	3	twoPaperAvg
503	3	twoPaperAvg
511	3	twoPaperAvg
565	3	twoPaperAvg
\.


--
-- TOC entry 5968 (class 0 OID 33449)
-- Dependencies: 230
-- Data for Name: form_1_exams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.form_1_exams (id, exam_name, term, year, created_at) FROM stdin;
7	opener_term_1_form_1_2025	1	2025	2025-05-07 12:57:35.112163
8	mid_term_1_form_1_2025	1	2025	2025-05-07 12:57:35.112163
9	end_term_1_form_1_2025	1	2025	2025-05-07 12:57:35.112163
\.


--
-- TOC entry 5985 (class 0 OID 41839)
-- Dependencies: 247
-- Data for Name: form_1_streams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.form_1_streams (id, stream_name, year, teacher_id, status) FROM stdin;
14	LOCALHOST	2025	1000	1
\.


--
-- TOC entry 5970 (class 0 OID 33459)
-- Dependencies: 232
-- Data for Name: form_2_exams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.form_2_exams (id, exam_name, term, year, created_at) FROM stdin;
\.


--
-- TOC entry 5987 (class 0 OID 41855)
-- Dependencies: 249
-- Data for Name: form_2_streams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.form_2_streams (id, stream_name, year, teacher_id, status) FROM stdin;
\.


--
-- TOC entry 5972 (class 0 OID 33469)
-- Dependencies: 234
-- Data for Name: form_3_exams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.form_3_exams (id, exam_name, term, year, created_at) FROM stdin;
\.


--
-- TOC entry 5989 (class 0 OID 41870)
-- Dependencies: 251
-- Data for Name: form_3_streams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.form_3_streams (id, stream_name, year, teacher_id, status) FROM stdin;
\.


--
-- TOC entry 5974 (class 0 OID 33479)
-- Dependencies: 236
-- Data for Name: form_4_exams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.form_4_exams (id, exam_name, term, year, created_at) FROM stdin;
4	mid_term_1_form_4_2025	1	2025	2025-04-09 13:26:22.706654
5	end_term_1_form_4_2025	1	2025	2025-04-09 13:26:22.706654
\.


--
-- TOC entry 5991 (class 0 OID 41885)
-- Dependencies: 253
-- Data for Name: form_4_streams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.form_4_streams (id, stream_name, year, teacher_id, status) FROM stdin;
4	WEST	2025	4520	1
3	LOCALHOST	2025	1000	1
5	ADDIS	2025	4520	1
6	KIMARU	2025	56881	1
\.


--
-- TOC entry 6017 (class 0 OID 59737)
-- Dependencies: 279
-- Data for Name: grading_end_term_1_form_1_2025; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grading_end_term_1_form_1_2025 (id, subject_id, e0, e1, dm0, dm1, d0, d1, dp0, dp1, cm0, cm1, c0, c1, cp0, cp1, bm0, bm1, b0, b1, bp0, bp1, am0, am1, a0, a1) FROM stdin;
101	101	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
102	102	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
121	121	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
122	122	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
231	231	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
232	232	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
233	233	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
236	236	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
237	237	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
311	311	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
312	312	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
313	313	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
314	314	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
315	315	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
441	441	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
442	442	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
443	443	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
444	444	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
445	445	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
446	446	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
447	447	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
448	448	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
449	449	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
450	450	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
451	451	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
501	501	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
502	502	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
503	503	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
511	511	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
565	565	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
\.


--
-- TOC entry 5978 (class 0 OID 34714)
-- Dependencies: 240
-- Data for Name: grading_end_term_1_form_4_2025; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grading_end_term_1_form_4_2025 (id, subject_id, e0, e1, dm0, dm1, d0, d1, dp0, dp1, cm0, cm1, c0, c1, cp0, cp1, bm0, bm1, b0, b1, bp0, bp1, am0, am1, a0, a1) FROM stdin;
101	101	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
102	102	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
121	121	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
122	122	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
231	231	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
232	232	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
233	233	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
236	236	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
237	237	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
311	311	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
312	312	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
313	313	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
314	314	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
315	315	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
441	441	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
442	442	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
443	443	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
444	444	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
445	445	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
446	446	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
447	447	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
448	448	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
449	449	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
450	450	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
451	451	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
501	501	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
502	502	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
503	503	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
511	511	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
565	565	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
\.


--
-- TOC entry 6016 (class 0 OID 59703)
-- Dependencies: 278
-- Data for Name: grading_mid_term_1_form_1_2025; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grading_mid_term_1_form_1_2025 (id, subject_id, e0, e1, dm0, dm1, d0, d1, dp0, dp1, cm0, cm1, c0, c1, cp0, cp1, bm0, bm1, b0, b1, bp0, bp1, am0, am1, a0, a1) FROM stdin;
101	101	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
102	102	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
121	121	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
122	122	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
231	231	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
232	232	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
233	233	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
236	236	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
237	237	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
311	311	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
312	312	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
313	313	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
314	314	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
315	315	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
441	441	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
442	442	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
443	443	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
444	444	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
445	445	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
446	446	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
447	447	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
448	448	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
449	449	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
450	450	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
451	451	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
501	501	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
502	502	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
503	503	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
511	511	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
565	565	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
\.


--
-- TOC entry 5977 (class 0 OID 34680)
-- Dependencies: 239
-- Data for Name: grading_mid_term_1_form_4_2025; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grading_mid_term_1_form_4_2025 (id, subject_id, e0, e1, dm0, dm1, d0, d1, dp0, dp1, cm0, cm1, c0, c1, cp0, cp1, bm0, bm1, b0, b1, bp0, bp1, am0, am1, a0, a1) FROM stdin;
102	102	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
121	121	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
122	122	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
231	231	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
232	232	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
233	233	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
236	236	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
237	237	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
311	311	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
312	312	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
313	313	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
314	314	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
315	315	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
441	441	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
442	442	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
443	443	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
444	444	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
445	445	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
446	446	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
447	447	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
448	448	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
449	449	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
450	450	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
451	451	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
501	501	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
502	502	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
503	503	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
511	511	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
565	565	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
101	101	0	12	13	17	18	22	23	27	28	32	33	37	38	42	43	47	48	52	53	57	58	62	63	100
\.


--
-- TOC entry 6015 (class 0 OID 59669)
-- Dependencies: 277
-- Data for Name: grading_opener_term_1_form_1_2025; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grading_opener_term_1_form_1_2025 (id, subject_id, e0, e1, dm0, dm1, d0, d1, dp0, dp1, cm0, cm1, c0, c1, cp0, cp1, bm0, bm1, b0, b1, bp0, bp1, am0, am1, a0, a1) FROM stdin;
102	102	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
121	121	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
122	122	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
231	231	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
232	232	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
233	233	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
236	236	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
237	237	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
311	311	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
312	312	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
313	313	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
314	314	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
315	315	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
441	441	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
442	442	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
443	443	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
444	444	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
445	445	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
446	446	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
447	447	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
448	448	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
449	449	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
450	450	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
451	451	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
501	501	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
502	502	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
503	503	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
511	511	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
565	565	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
101	101	0	29	30	34	35	39	40	44	45	49	50	54	55	59	60	64	65	69	70	74	75	79	80	100
\.


--
-- TOC entry 6013 (class 0 OID 59409)
-- Dependencies: 275
-- Data for Name: mid_term_1_form_1_2025; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mid_term_1_form_1_2025 (id, "101", "101_1", "101_2", "101_3", "102", "102_1", "102_2", "102_3", "121", "121_1", "121_2", "121_3", "122", "122_1", "122_2", "122_3", "231", "231_1", "231_2", "231_3", "232", "232_1", "232_2", "232_3", "233", "233_1", "233_2", "233_3", "236", "236_1", "236_2", "236_3", "237", "237_1", "237_2", "237_3", "311", "311_1", "311_2", "311_3", "312", "312_1", "312_2", "312_3", "313", "313_1", "313_2", "313_3", "314", "314_1", "314_2", "314_3", "315", "315_1", "315_2", "315_3", "441", "441_1", "441_2", "441_3", "442", "442_1", "442_2", "442_3", "443", "443_1", "443_2", "443_3", "444", "444_1", "444_2", "444_3", "445", "445_1", "445_2", "445_3", "446", "446_1", "446_2", "446_3", "447", "447_1", "447_2", "447_3", "448", "448_1", "448_2", "448_3", "449", "449_1", "449_2", "449_3", "450", "450_1", "450_2", "450_3", "451", "451_1", "451_2", "451_3", "501", "501_1", "501_2", "501_3", "502", "502_1", "502_2", "502_3", "503", "503_1", "503_2", "503_3", "511", "511_1", "511_2", "511_3", "565", "565_1", "565_2", "565_3") FROM stdin;
4520	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
12789	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
23427	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
34098	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
34634	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
45361	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
45734	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
45891	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
\.


--
-- TOC entry 6019 (class 0 OID 59783)
-- Dependencies: 281
-- Data for Name: mid_term_1_form_1_2025_paper_setup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mid_term_1_form_1_2025_paper_setup (id, papers, formula) FROM stdin;
101	3	twoPaperAvg
102	3	twoPaperAvg
121	3	twoPaperAvg
122	3	twoPaperAvg
231	3	twoPaperAvg
232	3	twoPaperAvg
233	3	twoPaperAvg
236	3	twoPaperAvg
237	3	twoPaperAvg
311	3	twoPaperAvg
312	3	twoPaperAvg
313	3	twoPaperAvg
314	3	twoPaperAvg
315	3	twoPaperAvg
441	3	twoPaperAvg
442	3	twoPaperAvg
443	3	twoPaperAvg
444	3	twoPaperAvg
445	3	twoPaperAvg
446	3	twoPaperAvg
447	3	twoPaperAvg
448	3	twoPaperAvg
449	3	twoPaperAvg
450	3	twoPaperAvg
451	3	twoPaperAvg
501	3	twoPaperAvg
502	3	twoPaperAvg
503	3	twoPaperAvg
511	3	twoPaperAvg
565	3	twoPaperAvg
\.


--
-- TOC entry 5975 (class 0 OID 34420)
-- Dependencies: 237
-- Data for Name: mid_term_1_form_4_2025; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mid_term_1_form_4_2025 (id, "101", "101_1", "101_2", "101_3", "102", "102_1", "102_2", "102_3", "121", "121_1", "121_2", "121_3", "122", "122_1", "122_2", "122_3", "231", "231_1", "231_2", "231_3", "232", "232_1", "232_2", "232_3", "233", "233_1", "233_2", "233_3", "236", "236_1", "236_2", "236_3", "237", "237_1", "237_2", "237_3", "311", "311_1", "311_2", "311_3", "312", "312_1", "312_2", "312_3", "313", "313_1", "313_2", "313_3", "314", "314_1", "314_2", "314_3", "315", "315_1", "315_2", "315_3", "441", "441_1", "441_2", "441_3", "442", "442_1", "442_2", "442_3", "443", "443_1", "443_2", "443_3", "444", "444_1", "444_2", "444_3", "445", "445_1", "445_2", "445_3", "446", "446_1", "446_2", "446_3", "447", "447_1", "447_2", "447_3", "448", "448_1", "448_2", "448_3", "449", "449_1", "449_2", "449_3", "450", "450_1", "450_2", "450_3", "451", "451_1", "451_2", "451_3", "501", "501_1", "501_2", "501_3", "502", "502_1", "502_2", "502_3", "503", "503_1", "503_2", "503_3", "511", "511_1", "511_2", "511_3", "565", "565_1", "565_2", "565_3") FROM stdin;
96545	34	34	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
35742	89	89	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
78972	99	99	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
12451	56	56	0	0	0	0	0	0	47	93	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
12459	78	78	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
\.


--
-- TOC entry 5979 (class 0 OID 34748)
-- Dependencies: 241
-- Data for Name: mid_term_1_form_4_2025_paper_setup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mid_term_1_form_4_2025_paper_setup (id, papers, formula, paper_1, paper_2, paper_3) FROM stdin;
102	3	twoPaperAvg	100	100	100
122	3	twoPaperAvg	100	100	100
232	3	twoPaperAvg	100	100	100
233	3	twoPaperAvg	100	100	100
236	3	twoPaperAvg	100	100	100
237	3	twoPaperAvg	100	100	100
314	3	twoPaperAvg	100	100	100
315	3	twoPaperAvg	100	100	100
441	3	twoPaperAvg	100	100	100
442	3	twoPaperAvg	100	100	100
443	3	twoPaperAvg	100	100	100
444	3	twoPaperAvg	100	100	100
445	3	twoPaperAvg	100	100	100
446	3	twoPaperAvg	100	100	100
447	3	twoPaperAvg	100	100	100
448	3	twoPaperAvg	100	100	100
449	3	twoPaperAvg	100	100	100
450	3	twoPaperAvg	100	100	100
451	3	twoPaperAvg	100	100	100
501	3	twoPaperAvg	100	100	100
502	3	twoPaperAvg	100	100	100
503	3	twoPaperAvg	100	100	100
511	3	twoPaperAvg	100	100	100
565	2	twoPaperAvg	100	100	100
311	2	twoPaperAvg	100	100	100
312	2	twoPaperAvg	100	100	100
313	2	twoPaperAvg	100	100	100
231	3	threePaperAddAgr	100	100	100
121	2	twoPaperAvg	100	100	100
101	1	threePaperAvg	100	100	100
\.


--
-- TOC entry 6012 (class 0 OID 59279)
-- Dependencies: 274
-- Data for Name: opener_term_1_form_1_2025; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opener_term_1_form_1_2025 (id, "101", "101_1", "101_2", "101_3", "102", "102_1", "102_2", "102_3", "121", "121_1", "121_2", "121_3", "122", "122_1", "122_2", "122_3", "231", "231_1", "231_2", "231_3", "232", "232_1", "232_2", "232_3", "233", "233_1", "233_2", "233_3", "236", "236_1", "236_2", "236_3", "237", "237_1", "237_2", "237_3", "311", "311_1", "311_2", "311_3", "312", "312_1", "312_2", "312_3", "313", "313_1", "313_2", "313_3", "314", "314_1", "314_2", "314_3", "315", "315_1", "315_2", "315_3", "441", "441_1", "441_2", "441_3", "442", "442_1", "442_2", "442_3", "443", "443_1", "443_2", "443_3", "444", "444_1", "444_2", "444_3", "445", "445_1", "445_2", "445_3", "446", "446_1", "446_2", "446_3", "447", "447_1", "447_2", "447_3", "448", "448_1", "448_2", "448_3", "449", "449_1", "449_2", "449_3", "450", "450_1", "450_2", "450_3", "451", "451_1", "451_2", "451_3", "501", "501_1", "501_2", "501_3", "502", "502_1", "502_2", "502_3", "503", "503_1", "503_2", "503_3", "511", "511_1", "511_2", "511_3", "565", "565_1", "565_2", "565_3") FROM stdin;
4520	56	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
12789	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
23427	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
34098	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
34634	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
45361	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
45734	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
45891	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
\.


--
-- TOC entry 6018 (class 0 OID 59771)
-- Dependencies: 280
-- Data for Name: opener_term_1_form_1_2025_paper_setup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opener_term_1_form_1_2025_paper_setup (id, papers, formula) FROM stdin;
101	3	twoPaperAvg
102	3	twoPaperAvg
121	3	twoPaperAvg
122	3	twoPaperAvg
231	3	twoPaperAvg
232	3	twoPaperAvg
233	3	twoPaperAvg
236	3	twoPaperAvg
237	3	twoPaperAvg
311	3	twoPaperAvg
312	3	twoPaperAvg
313	3	twoPaperAvg
314	3	twoPaperAvg
315	3	twoPaperAvg
441	3	twoPaperAvg
442	3	twoPaperAvg
443	3	twoPaperAvg
444	3	twoPaperAvg
445	3	twoPaperAvg
446	3	twoPaperAvg
447	3	twoPaperAvg
448	3	twoPaperAvg
449	3	twoPaperAvg
450	3	twoPaperAvg
451	3	twoPaperAvg
501	3	twoPaperAvg
502	3	twoPaperAvg
503	3	twoPaperAvg
511	3	twoPaperAvg
565	3	twoPaperAvg
\.


--
-- TOC entry 5995 (class 0 OID 49839)
-- Dependencies: 257
-- Data for Name: particulars; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.particulars (id, schoolname, motto, phone, address, email, website, logo_path, file_hash) FROM stdin;
119	KIMARU SCHOOLS	To the Uttermost	254743917360	43844 - 00100, Nairobi	info@kimaruschools.com	\N	/images/school_logo/image-1746696988688-913771681.webp	52f7181c4886822255d5b1b83db599179efbaa2c1da45b50fab32c3a48319d81
\.


--
-- TOC entry 5993 (class 0 OID 41906)
-- Dependencies: 255
-- Data for Name: principal_remark; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.principal_remark (id, comment) FROM stdin;
11	Very impressive results. You are almost at the top.
10	Great Achievement. A little more effort will take you even higher.
9	A Strong Performance. Focus on consistency to reach the top.
8	Good Work. Aim to refine your skills and reach your full potential.
7	Fair Effort. With more dedication, you can achieve even greater success.
6	Average Performance. Identify your weak areas and work on them.
5	Below Average. Put in more effort to improve your results.
4	Struggling. Consistency practice and seeking help will make a big difference.
3	Below Expectations. Serious improvement is necessary - do not give up.
2	Low Performance. Serious improvement is necessary - do not give up.
1	Extremely Low Performance. Serious improvement is necessary - do not give up.
12	Outstanding Performance. Keep up the excellent work.
\.


--
-- TOC entry 6022 (class 0 OID 59840)
-- Dependencies: 284
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (token_id, user_id, token, user_agent, ip_address, expires_at, created_at, revoked_at) FROM stdin;
45515f63-4928-4538-864c-cf43e84b8ddf	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	$2b$12$wgb96j2npGm9efRSM1ifceKs6dSVs2L9LQl8dQwndiaVTssGouHjy	PostmanRuntime/7.42.0	::1	2025-05-16 15:00:54.306688+03	2025-05-09 15:00:54.306688+03	\N
17710b81-2b4c-402a-b60c-32cdb6a20983	b2eebc99-9c0b-4ef8-bb6d-6bb9bd380b33	$2b$12$wJOuRU0vR0kZ0t1oGzPK3u5TduHvv0GniYDkGAeLwMtU0MGIZbdla	PostmanRuntime/7.42.0	::1	2025-05-16 15:03:34.259074+03	2025-05-09 15:03:34.259074+03	\N
589e4f4a-148b-4c63-81cf-aeba0cd90c00	b2eebc99-9c0b-4ef8-bb6d-6bb9bd380b33	$2b$12$id2/cjhV.aX8qmIxoppCCuIDenOtiasTVYABR61Cd.0K52lWvr0DG	PostmanRuntime/7.42.0	::1	2025-05-16 15:04:42.937068+03	2025-05-09 15:04:42.937068+03	\N
88db1cb9-04b8-4233-bc81-2600a7623e26	b2eebc99-9c0b-4ef8-bb6d-6bb9bd380b33	$2b$12$vWW5BOtkv4HILkQeQmxWgeFKtHzXhF8qV.b1xK0XB65KpJGo4.K8O	PostmanRuntime/7.42.0	::1	2025-05-16 15:05:34.031667+03	2025-05-09 15:05:34.031667+03	\N
d4a57d19-0da1-4ca0-9b16-b2714dd11285	b2eebc99-9c0b-4ef8-bb6d-6bb9bd380b33	$2b$12$Jda62LHrHLR8l7FNVMzQ7uKsR6dCVJBDul3ywSOD7Pc4ognEpN52m	PostmanRuntime/7.42.0	::1	2025-05-16 15:07:11.87571+03	2025-05-09 15:07:11.87571+03	\N
23653afb-eb2c-47fb-a25e-586f093ce8ff	b2eebc99-9c0b-4ef8-bb6d-6bb9bd380b33	$2b$12$LdmcX9Wg1gOD1zea8lMIvOl9QD7z6uIBZ8RkpviOXJB9gpl72ZKT6	PostmanRuntime/7.42.0	::1	2025-05-16 15:07:19.038571+03	2025-05-09 15:07:19.038571+03	\N
2a6b16dd-be29-45ff-9850-a418a19b2ba1	b2eebc99-9c0b-4ef8-bb6d-6bb9bd380b33	$2b$12$KklJains6tmGgoO4Nq5nzOrWsqfMcp6YQ3Y.UsSQ5wD9UVwV4B.oS	PostmanRuntime/7.42.0	::1	2025-05-16 15:07:20.993494+03	2025-05-09 15:07:20.993494+03	\N
46378ecf-7a08-4bd1-802c-8406d2b2caa0	b2eebc99-9c0b-4ef8-bb6d-6bb9bd380b33	$2b$12$pop3Xr.JdWSuEDroZ1OB8uq0BvWy27NzXDIpp1MdGDE/LL1p52vKS	PostmanRuntime/7.42.0	::1	2025-05-16 15:07:22.962185+03	2025-05-09 15:07:22.962185+03	\N
96358e37-39f0-42c1-a0d2-4aa3a8a96fa0	b2eebc99-9c0b-4ef8-bb6d-6bb9bd380b33	$2b$12$GKSqyXMvCUTRAV8kzeTpueKjpo22MYO5Ls3rq.IwsaDopyjDEui0m	PostmanRuntime/7.42.0	::1	2025-05-16 15:07:24.793963+03	2025-05-09 15:07:24.793963+03	\N
6a0a0fdd-61a9-4f27-86ad-d5d2c5894dd3	b2eebc99-9c0b-4ef8-bb6d-6bb9bd380b33	$2b$12$.Gmo0/ALTcOsXUIW24rj5OOXlF5f8O0q3IhY7i6OINeKRmm4PgukS	PostmanRuntime/7.42.0	::1	2025-05-16 15:08:22.035097+03	2025-05-09 15:08:22.035097+03	\N
9213cddc-433b-48ce-8aa3-a1e29a588235	b2eebc99-9c0b-4ef8-bb6d-6bb9bd380b33	$2b$12$z6a9.IqhBw9mjZmj4YKUt.RQSkzYBVIYA4YlV.8pjedzfhvwQjLWW	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	::1	2025-05-16 15:31:54.290439+03	2025-05-09 15:31:54.290439+03	\N
e927c044-b063-4060-934f-0ff020a405f3	b2eebc99-9c0b-4ef8-bb6d-6bb9bd380b33	$2b$12$2eoFM/0GyZlr7d7hqCyhkuQ.ZRKRbUOx9G2ehYJLS01.WfHhtoV/S	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	::1	2025-05-16 15:33:29.745244+03	2025-05-09 15:33:29.745244+03	\N
a04f7153-f734-4cac-868e-83ac4907ecfb	b2eebc99-9c0b-4ef8-bb6d-6bb9bd380b33	$2b$12$J3Vj1tgl.1xfc8wJ2FXuL.fPqK0iECTAfJ6WzRGXuKCnZPpGLdSua	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	::1	2025-05-16 15:34:35.415242+03	2025-05-09 15:34:35.415242+03	\N
dc64d31d-b6d1-488a-930d-c4adbcc0fed9	b2eebc99-9c0b-4ef8-bb6d-6bb9bd380b33	$2b$12$ZbQJNtXSXLPaJBT5vR3Mlerr/rPn.PfzMZI7n3kQaf4vOIkvVHzcW	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	::1	2025-05-16 15:37:50.484217+03	2025-05-09 15:37:50.484217+03	\N
f540052a-0785-4572-afb5-99718f99caf9	b2eebc99-9c0b-4ef8-bb6d-6bb9bd380b33	$2b$12$5cZUHVw6sR9sO4hC6Zg89uW80k/4rPEcRtVoKrtBd/99GXPqefIPa	PostmanRuntime/7.42.0	::1	2025-05-16 15:44:06.150725+03	2025-05-09 15:44:06.150725+03	\N
15db6535-885d-4598-9910-078eedfebcd7	007f0351-5c09-417c-9df6-53102afecc55	$2b$12$OluEFn3v0ijsalquDwPtB.35lBDf0leutau/CryfMCLQJNdgPC.CO	PostmanRuntime/7.42.0	::1	2025-05-16 15:50:04.425437+03	2025-05-09 15:50:04.425437+03	\N
121314f0-bcd7-43e5-884b-617de8ad7fce	007f0351-5c09-417c-9df6-53102afecc55	$2b$12$foI5bKjBvZ3B2opPNBUjYeO2rNs6hVvj6/VXdmYgz1V44XhaPdIf2	PostmanRuntime/7.42.0	::1	2025-05-16 16:10:56.133725+03	2025-05-09 16:10:56.133725+03	\N
81859cac-1b55-4aa0-b137-ad4173b69cb7	b2eebc99-9c0b-4ef8-bb6d-6bb9bd380b33	$2b$12$OEGqhnXF4W96LsOYXzHd4.eAYMb4d9Sf8oNZx9/SkEHQBKdyQWpRi	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	::1	2025-05-16 16:14:01.389078+03	2025-05-09 16:14:01.389078+03	\N
b7aa0b73-92b7-4c10-ad7d-382fa42121a6	b2eebc99-9c0b-4ef8-bb6d-6bb9bd380b33	$2b$12$hYngeorN7MPQ5JEfgxe10OUaErgitB.FGuFlY/mBytA/jZtMViLBO	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	::1	2025-05-16 16:14:35.524529+03	2025-05-09 16:14:35.524529+03	\N
cb68a5fa-2ada-46f8-8df8-0b7c8a62c8ec	007f0351-5c09-417c-9df6-53102afecc55	$2b$12$yeAcz4b1XTXyQ5pVM0Ow8.VzGNCJXKb7yLwDPmHMr.PicePBIn3wW	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	::1	2025-05-16 16:35:41.282115+03	2025-05-09 16:35:41.282115+03	\N
beb031c7-34b4-454e-b95d-a6b7d115775f	007f0351-5c09-417c-9df6-53102afecc55	$2b$12$FEtmGUGS59TajsbtqAt6euTl6FXcRIuKTfiVckGD2MLNZXesvoS3O	PostmanRuntime/7.42.0	::1	2025-05-16 16:42:39.244106+03	2025-05-09 16:42:39.244106+03	\N
4e901a60-ffa6-4fd0-b785-a5f261f2cca7	007f0351-5c09-417c-9df6-53102afecc55	$2b$12$hSflk2DMWg0E453/6cNv5u7juGiU8ZdDQePOYI.l0xq..5ye3F6Gq	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	::1	2025-05-16 16:51:05.094981+03	2025-05-09 16:51:05.094981+03	\N
65375b1d-9c30-4a6e-b0f5-1e993f69ba73	007f0351-5c09-417c-9df6-53102afecc55	$2b$12$oLHqbtlTXUQwmLDy5T6z/OJ7GSqpE5o37FLJ0hvthrS.fJGdY8DBS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	::1	2025-05-16 16:53:30.072508+03	2025-05-09 16:53:30.072508+03	\N
5c5eab20-fd2b-4cf2-956a-2777bf35c6c6	007f0351-5c09-417c-9df6-53102afecc55	$2b$12$YEpRnms6HcwRTfwXzRE20ewBrA1xl3HBUvsIBy4OcET3gBX2Zst9a	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	::1	2025-05-16 16:57:49.419219+03	2025-05-09 16:57:49.419219+03	\N
e7543548-a6d7-4c79-a526-55457cf1107a	007f0351-5c09-417c-9df6-53102afecc55	$2b$12$sRl9E6/zN.pRSfydKW6Jxet0dmp6XDm9O.KaV0WTVw2p1rEbY9oSm	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	::1	2025-05-16 17:09:13.33619+03	2025-05-09 17:09:13.33619+03	\N
88a27db3-2717-49e1-aedb-d559b2439414	007f0351-5c09-417c-9df6-53102afecc55	$2b$12$LLjguNFaDUeI709h8sI8semIO3qt7PWqQ9AFhCwc3wTho2w9irv2a	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	::1	2025-05-16 17:09:42.319344+03	2025-05-09 17:09:42.319344+03	\N
80288d76-8da6-4599-b5c1-b0590528c9e5	007f0351-5c09-417c-9df6-53102afecc55	$2b$12$fQt1sPpQD.Tkdca/qo0nGu5v.LSLX9E4nkA5P4uzLQM7IKLIGY.Fi	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	::1	2025-05-16 17:43:49.051574+03	2025-05-09 17:43:49.051574+03	\N
8c845e53-6793-4c7a-be33-fed899f7ad84	007f0351-5c09-417c-9df6-53102afecc55	$2b$12$scdxuvxkGl0EfBQe.CBYGO4rThHDd2cov.C.9bZDf627SbI9GaBHW	PostmanRuntime/7.42.0	::1	2025-05-16 17:50:12.344556+03	2025-05-09 17:50:12.344556+03	\N
d7ee7510-3259-462e-a173-c343f3d1e120	007f0351-5c09-417c-9df6-53102afecc55	$2b$12$3Y3PNqEDdfndeZVyGEvsOeoIQFIylVTX0o3S2iPnNZZHb/kg0og7C	PostmanRuntime/7.42.0	::1	2025-05-16 17:55:55.401413+03	2025-05-09 17:55:55.401413+03	\N
a9f92d19-e943-4679-8db3-ffec63e56818	007f0351-5c09-417c-9df6-53102afecc55	$2b$12$0ZrxybX4e5JD/Je5UciDeu.TOszrXk.G1g9MhzonLUVBevYQ1X0Nm	PostmanRuntime/7.42.0	::1	2025-05-16 18:07:04.384204+03	2025-05-09 18:07:04.384204+03	\N
0b5b1cd6-344f-4faa-b22c-1dfb86bfa8d7	007f0351-5c09-417c-9df6-53102afecc55	$2b$12$Kr3YgHFh/xqSN/q4D8ZqCuWfphq19FaRwFYkI5Aqaq9kgAR5JsOHu	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	::1	2025-05-16 19:14:49.256264+03	2025-05-09 19:14:49.256264+03	\N
36c81010-debc-4c53-9bd2-f559665187ad	007f0351-5c09-417c-9df6-53102afecc55	$2b$12$gNApR4R83Gsgf8Pc7/0sZ.uls2MM37Inhf1pRskk.aEjV0YGSwjqe	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	::1	2025-05-17 11:21:37.748231+03	2025-05-10 11:21:37.748231+03	\N
2cdb09bb-d0f4-4d30-a4d2-79e0ec5eb4fd	007f0351-5c09-417c-9df6-53102afecc55	$2b$12$UokW1Psj/.Jr5VoxenKuRub8A2w05xumHHJTEfd7P1ZIcv1.pXZta	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	::1	2025-05-17 12:16:20.6203+03	2025-05-10 12:16:20.6203+03	\N
d301e34c-8af2-4e6e-9939-f900f8b7a8d2	007f0351-5c09-417c-9df6-53102afecc55	$2b$12$OtalKg3oS8hQEqF4Nt1.9O09JlIUUmPm26m7nEc2SvERAVsRgz21u	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	::1	2025-05-18 11:00:58.147054+03	2025-05-11 11:00:58.147054+03	\N
\.


--
-- TOC entry 6023 (class 0 OID 59854)
-- Dependencies: 285
-- Data for Name: revoked_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.revoked_tokens (token_id, user_id, expires_at, revoked_at) FROM stdin;
af5d44df-be90-44b7-821c-954ecaf87fd4	007f0351-5c09-417c-9df6-53102afecc55	2025-05-09 16:57:38+03	2025-05-09 16:44:27.697793+03
c91f14f9-424e-40df-8e6a-f64cfb7be0ec	007f0351-5c09-417c-9df6-53102afecc55	2025-05-09 18:05:11+03	2025-05-09 17:56:42.564943+03
c943f0d3-432a-443b-aad0-d5715701618a	007f0351-5c09-417c-9df6-53102afecc55	2025-05-09 18:22:03+03	2025-05-09 18:09:37.126765+03
\.


--
-- TOC entry 6003 (class 0 OID 49928)
-- Dependencies: 265
-- Data for Name: smslogs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.smslogs (id, student_id, phone, message_id, response_code, description, "timestamp", unival, student_unival) FROM stdin;
3	12459	254743917360	1949502699	200	Success	2025-05-01T07:24:25.067Z	mid_term_1_form_4_2025	12459mid_term_1_form_4_2025
\.


--
-- TOC entry 5981 (class 0 OID 41658)
-- Dependencies: 243
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff (id, title, fname, mname, lname, sex, year, phone, email, image) FROM stdin;
1000	Mr.	Eva	Kanairo	Lokasa	M	2025	254743917360	kevbogonko@gmail.com	\N
56881	Mr.	Christiano	Ronaldo	Boss	M	2025	254743917360	joebongo@gmail.com	\N
4520	Mr.	Kim	Kimaru	Lokasa	M	2025	254743917360	joebongo1@gmail.com	\N
\.


--
-- TOC entry 6006 (class 0 OID 58044)
-- Dependencies: 268
-- Data for Name: staff_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_images (id, filename, path, folder, file_hash, uploaded_at) FROM stdin;
4520	image-1746532483675-22855793.webp	/images/teacher_photo/image-1746532483675-22855793.webp	teacher_photo	f11b263b4ca5d79a40dc41d596b14215e13271d73f172c09fa16f02e3a148e8a	2025-05-06 14:54:43.822
\.


--
-- TOC entry 6008 (class 0 OID 58077)
-- Dependencies: 270
-- Data for Name: streams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.streams (id, stream_name) FROM stdin;
1	LOCALHOST
2	WEST
3	NORTH
\.


--
-- TOC entry 6011 (class 0 OID 58662)
-- Dependencies: 273
-- Data for Name: student_form_1_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_form_1_images (id, year, filename, path, folder, file_hash, uploaded_at) FROM stdin;
4520	2025	image-1746515686477-229698185.webp	/images/student_photo/image-1746515686477-229698185.webp	student_photo	aaf1fa8a14a780efd9f564b39144bb28f4acea0ee9e360572056f4060fa21d53	2025-05-06 10:14:46.579
12789	2025	image-1746521511628-459728102.webp	/images/student_photo/image-1746521511628-459728102.webp	student_photo	f58ae85256671f6e252eaf959d2a4f149fced5292cd8ccb787b5d85e1213229a	2025-05-06 11:51:51.958
23427	2025	image-1746521614233-732101606.webp	/images/student_photo/image-1746521614233-732101606.webp	student_photo	7ace5292e2b7c84bc305743f62d8abe99c7beda3287e7941111754b21ba0c958	2025-05-06 11:53:34.265
34634	2025	image-1746527867398-989609969.webp	/images/student_photo/image-1746527867398-989609969.webp	student_photo	3f49c22865c3901e0242309a9b249726d15c8b8a8d2a31ab0c5ad392590177e1	2025-05-06 13:37:47.895
45361	2025	image-1746532187022-398529752.webp	/images/student_photo/image-1746532187022-398529752.webp	student_photo	5855eeb57a32f0dcae0a274e8266f6898050b1015cc851e3b718cd3d90d3d4a2	2025-05-06 14:49:47.187
\.


--
-- TOC entry 6010 (class 0 OID 58086)
-- Dependencies: 272
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students (uid, id, upi_number, fname, mname, lname, gender, dob, kcpe_marks, phone, year_of_enrolment, current_form, current_year, stream_id, status, address, created_at, updated_at) FROM stdin;
1	10157	23GHJK72	Kevin	Kim	Kim	M	2002-01-19	305	254743917360	2025	1	2025	2	Active	\N	2025-05-05 18:10:35.66354	2025-05-05 18:10:35.66354
2	10107	23GHAJK72	Ken	Alex	Opy	M	2002-01-19	305	254743917360	2025	1	2025	2	Active	\N	2025-05-05 18:14:16.33583	2025-05-05 18:14:16.33583
3	10457	23GAHJK72	Boss	Kim	Texas	M	2002-01-19	305	254743917360	2025	1	2025	2	Active	\N	2025-05-05 18:14:16.33583	2025-05-05 18:14:16.33583
4	10057	23GHDJK72	Mary	Kim	Oxlade	F	2002-01-19	305	254743917360	2025	1	2025	2	Active	\N	2025-05-05 18:14:16.33583	2025-05-05 18:14:16.33583
5	10134	23GHJKI72	Marcus	Take	Kubo	M	2002-01-19	305	254743917360	2025	1	2025	2	Active	\N	2025-05-05 18:14:16.33583	2025-05-05 18:14:16.33583
6	48373	23GFHJK72	Jude	Obama	Oto	F	2002-01-19	305	254743917360	2025	1	2025	2	Active	\N	2025-05-05 18:14:16.33583	2025-05-05 18:14:16.33583
7	63463	23GHJNK72	Baku	Bangui	Wizz	M	2002-01-19	305	254743917360	2025	1	2025	2	Active	\N	2025-05-05 18:14:16.33583	2025-05-05 18:14:16.33583
8	94647	23ZGHJK72	Mumbai	India	Kim	F	2002-01-19	305	254743917360	2025	1	2025	2	Active	\N	2025-05-05 18:14:16.33583	2025-05-05 18:14:16.33583
9	49025	23GHPJK72	Male	Nai	Kim	M	2002-01-19	305	254743917360	2025	1	2025	2	Active	\N	2025-05-05 18:14:16.33583	2025-05-05 18:14:16.33583
10	79363	23GHJKK72	Kanairo	Dakar	Halo	F	2002-01-19	305	254743917360	2025	1	2025	2	Active	\N	2025-05-05 18:14:16.33583	2025-05-05 18:14:16.33583
11	10235	23G4HJK72	Mombas	Qatay	Kim	M	2002-01-19	305	254743917360	2025	1	2025	2	Active	\N	2025-05-05 18:14:16.33583	2025-05-05 18:14:16.33583
\.


--
-- TOC entry 5963 (class 0 OID 25023)
-- Dependencies: 225
-- Data for Name: students_form_1; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students_form_1 (id, fname, mname, lname, sex, dob, stream_id, kcpe_marks, year, phone, address) FROM stdin;
23427	Donald	Elon	Musk	F	1997-07-15	1	350	2024	254743917360	Nairobi
34634	Benjaminn	Kanairo	Leipzi	M	2025-04-29	1	2345	2025	254743917360	Oslo
45361	Christiano	Ronaldo	Boss	F	2025-04-14	1	234	2025	254117029192	Nairobi
45734	Eva	Kimaru	Lokasa	M	2025-04-30	1	234	2025	254117029192	Kimaru
45891	Andre	Onana	Onana	M	2025-04-20	1	300	2025	254117029192	Kisii
4520	Christiano	Ronaldo	Boss	F	2025-04-18	1	330	2024	254743917360	Kisii
34098	Christiano	Ronaldo	Boss	F	2025-04-17	1	330	2024	254743917360	Kisii
12789	Christiano	Ronaldo	Boss	F	2025-04-17	1	330	2024	254743917360	Kisii
452023	Christiano	Kanairo	Tim	M	2025-05-12	1	234	2025	254743917360	Nairobi
\.


--
-- TOC entry 5964 (class 0 OID 25071)
-- Dependencies: 226
-- Data for Name: students_form_2; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students_form_2 (id, fname, mname, lname, sex, dob, stream_id, kcpe_marks, year, phone, address) FROM stdin;
10134	Kevin	Bogonko	Kimaru	M	2023-04-12	1	335	2025	743917360	\N
35742	Hendick	Bog	Kim	M	2018-03-15	1	345	2025	743347360	\N
12459	Christiano	Nza	Ronaldo	M	1980-01-28	1	242	2025	756032891	\N
96545	David	Quintana	Degea	M	1993-07-22	1	195	2025	743994562	\N
12451	Mazraoui	Quika	Kimaru	F	2023-04-12	1	335	2025	734813360	\N
78972	Amad	Diallo	Kimaru	M	2023-04-12	1	335	2025	31677360	\N
67870	Benjaminn	Ronaldo	Tim	F	2025-04-15	1	335	2025	710743988	Kisii
74562	BobII	Ronaldo	Leipzi	F	2025-04-22	1	305	2025	794470616	Kimaru
\.


--
-- TOC entry 5965 (class 0 OID 25083)
-- Dependencies: 227
-- Data for Name: students_form_3; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students_form_3 (id, fname, mname, lname, sex, dob, stream_id, kcpe_marks, year, phone, address) FROM stdin;
10134	Kevin	Bogonko	Kimaru	M	2023-04-12	1	335	2025	743917360	\N
35742	Hendick	Bog	Kim	M	2018-03-15	1	345	2025	743347360	\N
12459	Christiano	Nza	Ronaldo	M	1980-01-28	1	242	2025	756032891	\N
96545	David	Quintana	Degea	M	1993-07-22	1	195	2025	743994562	\N
12451	Mazraoui	Quika	Kimaru	F	2023-04-12	1	335	2025	734813360	\N
78972	Amad	Diallo	Kimaru	M	2023-04-12	1	335	2025	31677360	\N
\.


--
-- TOC entry 5966 (class 0 OID 25095)
-- Dependencies: 228
-- Data for Name: students_form_4; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students_form_4 (id, fname, mname, lname, sex, dob, stream_id, kcpe_marks, year, phone, address) FROM stdin;
78972	Amad	Diallo	Kimaru	M	2023-04-12	5	335	2025	31677360	\N
96545	David	Quintana	Degea	M	1993-07-22	3	195	2025	758425453	\N
12459	Christiano	Nza	Ronaldo	M	1980-01-28	3	242	2025	254743917360	\N
12451	Mazraoui	Quika	Kimaru	F	2023-04-11	3	335	2025	254117029192	\N
35742	Christiano	Nza	Ronaldo	M	1980-01-26	3	242	2025	254743917360	\N
\.


--
-- TOC entry 5959 (class 0 OID 24812)
-- Dependencies: 221
-- Data for Name: subjects_form_1; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjects_form_1 (id, name, init, status) FROM stdin;
101	ENGLISH	ENG	1
102	KISWAHILI	KIS	1
121	MATHEMATICS A	MAT	1
122	MATHEMATICS B	MAT	0
231	BIOLOGY	BIO	1
232	PHYSICS	PHY	1
233	CHEMISTRY	CHE	1
236	BIOLOGY F.B	BIO	0
237	GEN. SCIENCE	GSC	0
311	HISTORY & GOV	H&G	1
312	GEOGRAPHY	GEO	1
313	CHRISTIAN RE	CRE	1
314	ISLAMIC RE	IRE	0
315	HINDU RE	HRE	0
441	HOME SC.	HMS	0
442	ART & DESIGN	A&D	0
443	AGRICULTURE	AGR	1
444	WOODWORK	WW	0
445	METALWORK	MW	0
446	BUILDING & CON.	B&C	0
447	POWER MECHANICS	PM	0
448	ELECTRICITY	ELC	0
449	DRAWING & DESIGN	DRD	0
450	AVIATION TECH.	AVT	0
451	COMPUTER SC.	CST	1
501	FRENCH	FRE	0
502	GERMAN	GER	0
503	ARABIC	ARB	0
511	MUSIC	MSC	0
565	BUSINESS ST.	BST	1
\.


--
-- TOC entry 5960 (class 0 OID 24817)
-- Dependencies: 222
-- Data for Name: subjects_form_2; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjects_form_2 (id, name, init, status) FROM stdin;
101	ENGLISH	ENG	1
102	KISWAHILI	KIS	1
121	MATHEMATICS A	MAT	1
122	MATHEMATICS B	MAT	0
231	BIOLOGY	BIO	1
232	PHYSICS	PHY	1
233	CHEMISTRY	CHE	1
236	BIOLOGY F.B	BIO	0
237	GEN. SCIENCE	GSC	0
311	HISTORY & GOV	H&G	1
312	GEOGRAPHY	GEO	1
313	CHRISTIAN RE	CRE	1
314	ISLAMIC RE	IRE	0
315	HINDU RE	HRE	0
441	HOME SC.	HMS	0
442	ART & DESIGN	A&D	0
443	AGRICULTURE	AGR	1
444	WOODWORK	WW	0
445	METALWORK	MW	0
446	BUILDING & CON.	B&C	0
447	POWER MECHANICS	PM	0
448	ELECTRICITY	ELC	0
449	DRAWING & DESIGN	DRD	0
450	AVIATION TECH.	AVT	0
451	COMPUTER SC.	CST	1
501	FRENCH	FRE	0
502	GERMAN	GER	0
503	ARABIC	ARB	0
511	MUSIC	MSC	0
565	BUSINESS ST.	BST	1
\.


--
-- TOC entry 5961 (class 0 OID 24822)
-- Dependencies: 223
-- Data for Name: subjects_form_3; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjects_form_3 (id, name, init, status) FROM stdin;
101	ENGLISH	ENG	1
102	KISWAHILI	KIS	1
121	MATHEMATICS A	MAT	1
122	MATHEMATICS B	MAT	0
231	BIOLOGY	BIO	1
232	PHYSICS	PHY	1
233	CHEMISTRY	CHE	1
236	BIOLOGY F.B	BIO	0
237	GEN. SCIENCE	GSC	0
311	HISTORY & GOV	H&G	1
312	GEOGRAPHY	GEO	1
313	CHRISTIAN RE	CRE	1
314	ISLAMIC RE	IRE	0
315	HINDU RE	HRE	0
441	HOME SC.	HMS	0
442	ART & DESIGN	A&D	0
443	AGRICULTURE	AGR	1
444	WOODWORK	WW	0
445	METALWORK	MW	0
446	BUILDING & CON.	B&C	0
447	POWER MECHANICS	PM	0
448	ELECTRICITY	ELC	0
449	DRAWING & DESIGN	DRD	0
450	AVIATION TECH.	AVT	0
451	COMPUTER SC.	CST	1
501	FRENCH	FRE	0
502	GERMAN	GER	0
503	ARABIC	ARB	0
511	MUSIC	MSC	0
565	BUSINESS ST.	BST	1
\.


--
-- TOC entry 5962 (class 0 OID 24827)
-- Dependencies: 224
-- Data for Name: subjects_form_4; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjects_form_4 (id, name, init, status) FROM stdin;
101	ENGLISH	ENG	1
102	KISWAHILI	KIS	1
121	MATHEMATICS A	MAT	1
122	MATHEMATICS B	MAT	0
231	BIOLOGY	BIO	1
232	PHYSICS	PHY	1
233	CHEMISTRY	CHE	1
236	BIOLOGY F.B	BIO	0
237	GEN. SCIENCE	GSC	0
311	HISTORY & GOV	H&G	1
312	GEOGRAPHY	GEO	1
313	CHRISTIAN RE	CRE	1
314	ISLAMIC RE	IRE	0
315	HINDU RE	HRE	0
441	HOME SC.	HMS	0
442	ART & DESIGN	A&D	0
443	AGRICULTURE	AGR	1
444	WOODWORK	WW	0
445	METALWORK	MW	0
446	BUILDING & CON.	B&C	0
447	POWER MECHANICS	PM	0
448	ELECTRICITY	ELC	0
449	DRAWING & DESIGN	DRD	0
450	AVIATION TECH.	AVT	0
451	COMPUTER SC.	CST	1
501	FRENCH	FRE	0
502	GERMAN	GER	0
503	ARABIC	ARB	0
511	MUSIC	MSC	0
565	BUSINESS ST.	BST	1
\.


--
-- TOC entry 5983 (class 0 OID 41670)
-- Dependencies: 245
-- Data for Name: subjectteachers_form_1; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjectteachers_form_1 (id, stream_id, teacher_id, subject_id, year, unival) FROM stdin;
8	12	1000	101	2025	12_101_2025
9	13	1000	101	2025	13_101_2025
11	14	1000	102	2025	14_102_2025
10	14	56881	101	2025	14_101_2025
\.


--
-- TOC entry 5997 (class 0 OID 49847)
-- Dependencies: 259
-- Data for Name: subjectteachers_form_2; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjectteachers_form_2 (id, stream_id, teacher_id, subject_id, year, unival) FROM stdin;
\.


--
-- TOC entry 5999 (class 0 OID 49866)
-- Dependencies: 261
-- Data for Name: subjectteachers_form_3; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjectteachers_form_3 (id, stream_id, teacher_id, subject_id, year, unival) FROM stdin;
\.


--
-- TOC entry 6001 (class 0 OID 49885)
-- Dependencies: 263
-- Data for Name: subjectteachers_form_4; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjectteachers_form_4 (id, stream_id, teacher_id, subject_id, year, unival) FROM stdin;
1	5	1000	101	2025	5_101_2025
2	5	56881	231	2025	5_231_2025
3	3	56881	231	2025	3_231_2025
4	3	1000	313	2025	3_313_2025
5	5	4520	102	2025	5_102_2025
6	5	56881	121	2025	5_121_2025
7	5	4520	232	2025	5_232_2025
8	5	1000	233	2025	5_233_2025
9	5	56881	312	2025	5_312_2025
10	5	4520	311	2025	5_311_2025
11	5	1000	313	2025	5_313_2025
12	5	56881	443	2025	5_443_2025
13	5	1000	451	2025	5_451_2025
14	5	1000	565	2025	5_565_2025
\.


--
-- TOC entry 6005 (class 0 OID 58027)
-- Dependencies: 267
-- Data for Name: uploaded_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.uploaded_images (id, filename, path, folder, file_hash, uploaded_at) FROM stdin;
1	image-1746453400884-136165478.webp	/images/student_photo/image-1746453400884-136165478.webp	student_photo	aaf1fa8a14a780efd9f564b39144bb28f4acea0ee9e360572056f4060fa21d53	2025-05-05 16:56:40.992028
2	image-1746454754276-174004584.webp	/images/student_photo/image-1746454754276-174004584.webp	student_photo	7ace5292e2b7c84bc305743f62d8abe99c7beda3287e7941111754b21ba0c958	2025-05-05 17:19:14.298
3	image-1746455666279-853613900.webp	/images/student_photo/image-1746455666279-853613900.webp	student_photo	05467cafa5dc9e7e3a0a18dceb71f461c771216e722573d5a20ca1e558531a8e	2025-05-05 17:34:26.438
4	image-1746463110811-582650134.webp	/images/student_photo/image-1746463110811-582650134.webp	student_photo	f73c0f4a4d7f9511c34f2a1a0cb0a912a5c87b9fb4a5ed4a4b9368754497c179	2025-05-05 19:38:31.419
5	image-1746463187906-597792593.webp	/images/student_photo/image-1746463187906-597792593.webp	student_photo	f58ae85256671f6e252eaf959d2a4f149fced5292cd8ccb787b5d85e1213229a	2025-05-05 19:39:48.278
6	image-1746463265629-229921075.webp	/images/student_photo/image-1746463265629-229921075.webp	student_photo	f859614ff835d958bb691044b3f2ab3328f9b5d6db642cc414e031e8a6a24f20	2025-05-05 19:41:05.724
\.


--
-- TOC entry 6021 (class 0 OID 59826)
-- Dependencies: 283
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, is_active, token_version, created_at, updated_at) FROM stdin;
b2eebc99-9c0b-4ef8-bb6d-6bb9bd380b33	user2@example.com	$2b$12$be1OKu/SGPGC8exSQHyv2emXww7jHJWgrJ.wqbM8q92SeIBJqHlm6	t	cd333dfd-661e-4f1b-9b08-7ae8953c6205	2023-02-20 17:15:00+03	2023-02-20 17:15:00+03
007f0351-5c09-417c-9df6-53102afecc55	user3@example.com	$2b$10$TvEjnQV5eJRmoJeWRI21Mu2B7vHYDGdS0zsJ4IV0wmgaXvzcQukdW	t	3a01d0e2-e494-443b-a158-c2325a68dede	2025-05-09 15:49:28.274349+03	2025-05-09 15:49:28.274349+03
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	user1@example.com	$2b$12$TIDh/Ojjs9ioYAoq.TSdfuRM2y65CW5JfPprcP5TISRADT704qzZ2	t	e0dd08bd-d78e-4885-b017-f1a872f51ab6	2023-01-15 12:30:00+03	2023-01-15 12:30:00+03
d4eebc99-9c0b-4ef8-bb6d-6bb9bd380d55	disabled@example.com	$2b$12$UzibbcusR8nMbvO4ckmp6eSe934wk7m1fkuKDN98FoPXBB.hZuyBi	f	ff4b8517-0cb7-43d6-9642-2baedd0a78f1	2023-03-10 14:20:00+03	2023-03-10 14:20:00+03
\.


--
-- TOC entry 6047 (class 0 OID 0)
-- Dependencies: 219
-- Name: auth_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_id_seq', 6, true);


--
-- TOC entry 6048 (class 0 OID 0)
-- Dependencies: 229
-- Name: form_1_exams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.form_1_exams_id_seq', 9, true);


--
-- TOC entry 6049 (class 0 OID 0)
-- Dependencies: 246
-- Name: form_1_streams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.form_1_streams_id_seq', 15, true);


--
-- TOC entry 6050 (class 0 OID 0)
-- Dependencies: 231
-- Name: form_2_exams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.form_2_exams_id_seq', 1, false);


--
-- TOC entry 6051 (class 0 OID 0)
-- Dependencies: 248
-- Name: form_2_streams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.form_2_streams_id_seq', 2, true);


--
-- TOC entry 6052 (class 0 OID 0)
-- Dependencies: 233
-- Name: form_3_exams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.form_3_exams_id_seq', 1, false);


--
-- TOC entry 6053 (class 0 OID 0)
-- Dependencies: 250
-- Name: form_3_streams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.form_3_streams_id_seq', 2, true);


--
-- TOC entry 6054 (class 0 OID 0)
-- Dependencies: 235
-- Name: form_4_exams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.form_4_exams_id_seq', 5, true);


--
-- TOC entry 6055 (class 0 OID 0)
-- Dependencies: 252
-- Name: form_4_streams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.form_4_streams_id_seq', 6, true);


--
-- TOC entry 6056 (class 0 OID 0)
-- Dependencies: 264
-- Name: smslogs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.smslogs_id_seq', 11, true);


--
-- TOC entry 6057 (class 0 OID 0)
-- Dependencies: 269
-- Name: streams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.streams_id_seq', 3, true);


--
-- TOC entry 6058 (class 0 OID 0)
-- Dependencies: 271
-- Name: students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.students_id_seq', 11, true);


--
-- TOC entry 6059 (class 0 OID 0)
-- Dependencies: 244
-- Name: subjectteachers_form_1_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subjectteachers_form_1_id_seq', 11, true);


--
-- TOC entry 6060 (class 0 OID 0)
-- Dependencies: 258
-- Name: subjectteachers_form_2_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subjectteachers_form_2_id_seq', 1, false);


--
-- TOC entry 6061 (class 0 OID 0)
-- Dependencies: 260
-- Name: subjectteachers_form_3_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subjectteachers_form_3_id_seq', 1, false);


--
-- TOC entry 6062 (class 0 OID 0)
-- Dependencies: 262
-- Name: subjectteachers_form_4_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subjectteachers_form_4_id_seq', 14, true);


--
-- TOC entry 6063 (class 0 OID 0)
-- Dependencies: 266
-- Name: uploaded_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.uploaded_images_id_seq', 6, true);


--
-- TOC entry 5642 (class 2606 OID 16412)
-- Name: auth auth_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth
    ADD CONSTRAINT auth_pkey PRIMARY KEY (id);


--
-- TOC entry 5644 (class 2606 OID 16414)
-- Name: auth auth_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth
    ADD CONSTRAINT auth_username_key UNIQUE (username);


--
-- TOC entry 5720 (class 2606 OID 41919)
-- Name: classteacher_remark classteacher_remark_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classteacher_remark
    ADD CONSTRAINT classteacher_remark_pkey PRIMARY KEY (id);


--
-- TOC entry 5716 (class 2606 OID 41905)
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- TOC entry 5770 (class 2606 OID 59801)
-- Name: end_term_1_form_1_2025_paper_setup end_term_1_form_1_2025_paper_setup_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.end_term_1_form_1_2025_paper_setup
    ADD CONSTRAINT end_term_1_form_1_2025_paper_setup_pkey PRIMARY KEY (id);


--
-- TOC entry 5758 (class 2606 OID 59663)
-- Name: end_term_1_form_1_2025 end_term_1_form_1_2025_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.end_term_1_form_1_2025
    ADD CONSTRAINT end_term_1_form_1_2025_pkey PRIMARY KEY (id);


--
-- TOC entry 5688 (class 2606 OID 34766)
-- Name: end_term_1_form_4_2025_paper_setup end_term_1_form_4_2025_paper_setup_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.end_term_1_form_4_2025_paper_setup
    ADD CONSTRAINT end_term_1_form_4_2025_paper_setup_pkey PRIMARY KEY (id);


--
-- TOC entry 5680 (class 2606 OID 34674)
-- Name: end_term_1_form_4_2025 end_term_1_form_4_2025_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.end_term_1_form_4_2025
    ADD CONSTRAINT end_term_1_form_4_2025_pkey PRIMARY KEY (id);


--
-- TOC entry 5662 (class 2606 OID 33457)
-- Name: form_1_exams form_1_exams_exam_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_1_exams
    ADD CONSTRAINT form_1_exams_exam_name_key UNIQUE (exam_name);


--
-- TOC entry 5664 (class 2606 OID 33455)
-- Name: form_1_exams form_1_exams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_1_exams
    ADD CONSTRAINT form_1_exams_pkey PRIMARY KEY (id);


--
-- TOC entry 5700 (class 2606 OID 41845)
-- Name: form_1_streams form_1_streams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_1_streams
    ADD CONSTRAINT form_1_streams_pkey PRIMARY KEY (id);


--
-- TOC entry 5702 (class 2606 OID 41847)
-- Name: form_1_streams form_1_streams_stream_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_1_streams
    ADD CONSTRAINT form_1_streams_stream_name_key UNIQUE (stream_name);


--
-- TOC entry 5666 (class 2606 OID 33467)
-- Name: form_2_exams form_2_exams_exam_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_2_exams
    ADD CONSTRAINT form_2_exams_exam_name_key UNIQUE (exam_name);


--
-- TOC entry 5668 (class 2606 OID 33465)
-- Name: form_2_exams form_2_exams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_2_exams
    ADD CONSTRAINT form_2_exams_pkey PRIMARY KEY (id);


--
-- TOC entry 5704 (class 2606 OID 41861)
-- Name: form_2_streams form_2_streams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_2_streams
    ADD CONSTRAINT form_2_streams_pkey PRIMARY KEY (id);


--
-- TOC entry 5706 (class 2606 OID 41863)
-- Name: form_2_streams form_2_streams_stream_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_2_streams
    ADD CONSTRAINT form_2_streams_stream_name_key UNIQUE (stream_name);


--
-- TOC entry 5670 (class 2606 OID 33477)
-- Name: form_3_exams form_3_exams_exam_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_3_exams
    ADD CONSTRAINT form_3_exams_exam_name_key UNIQUE (exam_name);


--
-- TOC entry 5672 (class 2606 OID 33475)
-- Name: form_3_exams form_3_exams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_3_exams
    ADD CONSTRAINT form_3_exams_pkey PRIMARY KEY (id);


--
-- TOC entry 5708 (class 2606 OID 41876)
-- Name: form_3_streams form_3_streams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_3_streams
    ADD CONSTRAINT form_3_streams_pkey PRIMARY KEY (id);


--
-- TOC entry 5710 (class 2606 OID 41878)
-- Name: form_3_streams form_3_streams_stream_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_3_streams
    ADD CONSTRAINT form_3_streams_stream_name_key UNIQUE (stream_name);


--
-- TOC entry 5674 (class 2606 OID 33487)
-- Name: form_4_exams form_4_exams_exam_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_4_exams
    ADD CONSTRAINT form_4_exams_exam_name_key UNIQUE (exam_name);


--
-- TOC entry 5676 (class 2606 OID 33485)
-- Name: form_4_exams form_4_exams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_4_exams
    ADD CONSTRAINT form_4_exams_pkey PRIMARY KEY (id);


--
-- TOC entry 5712 (class 2606 OID 41891)
-- Name: form_4_streams form_4_streams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_4_streams
    ADD CONSTRAINT form_4_streams_pkey PRIMARY KEY (id);


--
-- TOC entry 5714 (class 2606 OID 41893)
-- Name: form_4_streams form_4_streams_stream_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_4_streams
    ADD CONSTRAINT form_4_streams_stream_name_key UNIQUE (stream_name);


--
-- TOC entry 5764 (class 2606 OID 59765)
-- Name: grading_end_term_1_form_1_2025 grading_end_term_1_form_1_2025_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grading_end_term_1_form_1_2025
    ADD CONSTRAINT grading_end_term_1_form_1_2025_pkey PRIMARY KEY (id);


--
-- TOC entry 5684 (class 2606 OID 34742)
-- Name: grading_end_term_1_form_4_2025 grading_end_term_1_form_4_2025_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grading_end_term_1_form_4_2025
    ADD CONSTRAINT grading_end_term_1_form_4_2025_pkey PRIMARY KEY (id);


--
-- TOC entry 5762 (class 2606 OID 59731)
-- Name: grading_mid_term_1_form_1_2025 grading_mid_term_1_form_1_2025_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grading_mid_term_1_form_1_2025
    ADD CONSTRAINT grading_mid_term_1_form_1_2025_pkey PRIMARY KEY (id);


--
-- TOC entry 5682 (class 2606 OID 34708)
-- Name: grading_mid_term_1_form_4_2025 grading_mid_term_1_form_4_2025_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grading_mid_term_1_form_4_2025
    ADD CONSTRAINT grading_mid_term_1_form_4_2025_pkey PRIMARY KEY (id);


--
-- TOC entry 5760 (class 2606 OID 59697)
-- Name: grading_opener_term_1_form_1_2025 grading_opener_term_1_form_1_2025_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grading_opener_term_1_form_1_2025
    ADD CONSTRAINT grading_opener_term_1_form_1_2025_pkey PRIMARY KEY (id);


--
-- TOC entry 5768 (class 2606 OID 59789)
-- Name: mid_term_1_form_1_2025_paper_setup mid_term_1_form_1_2025_paper_setup_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mid_term_1_form_1_2025_paper_setup
    ADD CONSTRAINT mid_term_1_form_1_2025_paper_setup_pkey PRIMARY KEY (id);


--
-- TOC entry 5756 (class 2606 OID 59533)
-- Name: mid_term_1_form_1_2025 mid_term_1_form_1_2025_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mid_term_1_form_1_2025
    ADD CONSTRAINT mid_term_1_form_1_2025_pkey PRIMARY KEY (id);


--
-- TOC entry 5686 (class 2606 OID 34754)
-- Name: mid_term_1_form_4_2025_paper_setup mid_term_1_form_4_2025_paper_setup_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mid_term_1_form_4_2025_paper_setup
    ADD CONSTRAINT mid_term_1_form_4_2025_paper_setup_pkey PRIMARY KEY (id);


--
-- TOC entry 5678 (class 2606 OID 34544)
-- Name: mid_term_1_form_4_2025 mid_term_1_form_4_2025_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mid_term_1_form_4_2025
    ADD CONSTRAINT mid_term_1_form_4_2025_pkey PRIMARY KEY (id);


--
-- TOC entry 5766 (class 2606 OID 59777)
-- Name: opener_term_1_form_1_2025_paper_setup opener_term_1_form_1_2025_paper_setup_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opener_term_1_form_1_2025_paper_setup
    ADD CONSTRAINT opener_term_1_form_1_2025_paper_setup_pkey PRIMARY KEY (id);


--
-- TOC entry 5754 (class 2606 OID 59403)
-- Name: opener_term_1_form_1_2025 opener_term_1_form_1_2025_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opener_term_1_form_1_2025
    ADD CONSTRAINT opener_term_1_form_1_2025_pkey PRIMARY KEY (id);


--
-- TOC entry 5722 (class 2606 OID 49845)
-- Name: particulars particulars_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.particulars
    ADD CONSTRAINT particulars_pkey PRIMARY KEY (id);


--
-- TOC entry 5718 (class 2606 OID 41912)
-- Name: principal_remark principal_remark_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.principal_remark
    ADD CONSTRAINT principal_remark_pkey PRIMARY KEY (id);


--
-- TOC entry 5776 (class 2606 OID 59848)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (token_id);


--
-- TOC entry 5779 (class 2606 OID 59859)
-- Name: revoked_tokens revoked_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revoked_tokens
    ADD CONSTRAINT revoked_tokens_pkey PRIMARY KEY (token_id);


--
-- TOC entry 5736 (class 2606 OID 49935)
-- Name: smslogs smslogs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.smslogs
    ADD CONSTRAINT smslogs_pkey PRIMARY KEY (id);


--
-- TOC entry 5690 (class 2606 OID 41666)
-- Name: staff staff_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_email_key UNIQUE (email);


--
-- TOC entry 5742 (class 2606 OID 58051)
-- Name: staff_images staff_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_images
    ADD CONSTRAINT staff_images_pkey PRIMARY KEY (id);


--
-- TOC entry 5692 (class 2606 OID 41664)
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- TOC entry 5744 (class 2606 OID 58084)
-- Name: streams streams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.streams
    ADD CONSTRAINT streams_pkey PRIMARY KEY (id);


--
-- TOC entry 5752 (class 2606 OID 58669)
-- Name: student_form_1_images student_form_1_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_form_1_images
    ADD CONSTRAINT student_form_1_images_pkey PRIMARY KEY (id);


--
-- TOC entry 5746 (class 2606 OID 58101)
-- Name: students students_admission_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_admission_number_key UNIQUE (id);


--
-- TOC entry 5654 (class 2606 OID 25029)
-- Name: students_form_1 students_form_1_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students_form_1
    ADD CONSTRAINT students_form_1_pkey PRIMARY KEY (id);


--
-- TOC entry 5656 (class 2606 OID 25077)
-- Name: students_form_2 students_form_2_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students_form_2
    ADD CONSTRAINT students_form_2_pkey PRIMARY KEY (id);


--
-- TOC entry 5658 (class 2606 OID 25089)
-- Name: students_form_3 students_form_3_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students_form_3
    ADD CONSTRAINT students_form_3_pkey PRIMARY KEY (id);


--
-- TOC entry 5660 (class 2606 OID 25101)
-- Name: students_form_4 students_form_4_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students_form_4
    ADD CONSTRAINT students_form_4_pkey PRIMARY KEY (id);


--
-- TOC entry 5748 (class 2606 OID 58099)
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (uid);


--
-- TOC entry 5750 (class 2606 OID 58103)
-- Name: students students_upi_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_upi_number_key UNIQUE (upi_number);


--
-- TOC entry 5646 (class 2606 OID 24816)
-- Name: subjects_form_1 subjects_form_1_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects_form_1
    ADD CONSTRAINT subjects_form_1_pkey PRIMARY KEY (id);


--
-- TOC entry 5648 (class 2606 OID 24821)
-- Name: subjects_form_2 subjects_form_2_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects_form_2
    ADD CONSTRAINT subjects_form_2_pkey PRIMARY KEY (id);


--
-- TOC entry 5650 (class 2606 OID 24826)
-- Name: subjects_form_3 subjects_form_3_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects_form_3
    ADD CONSTRAINT subjects_form_3_pkey PRIMARY KEY (id);


--
-- TOC entry 5652 (class 2606 OID 24831)
-- Name: subjects_form_4 subjects_form_4_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects_form_4
    ADD CONSTRAINT subjects_form_4_pkey PRIMARY KEY (id);


--
-- TOC entry 5696 (class 2606 OID 41675)
-- Name: subjectteachers_form_1 subjectteachers_form_1_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjectteachers_form_1
    ADD CONSTRAINT subjectteachers_form_1_pkey PRIMARY KEY (id);


--
-- TOC entry 5698 (class 2606 OID 41677)
-- Name: subjectteachers_form_1 subjectteachers_form_1_unival_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjectteachers_form_1
    ADD CONSTRAINT subjectteachers_form_1_unival_key UNIQUE (unival);


--
-- TOC entry 5724 (class 2606 OID 49852)
-- Name: subjectteachers_form_2 subjectteachers_form_2_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjectteachers_form_2
    ADD CONSTRAINT subjectteachers_form_2_pkey PRIMARY KEY (id);


--
-- TOC entry 5726 (class 2606 OID 49854)
-- Name: subjectteachers_form_2 subjectteachers_form_2_unival_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjectteachers_form_2
    ADD CONSTRAINT subjectteachers_form_2_unival_key UNIQUE (unival);


--
-- TOC entry 5728 (class 2606 OID 49871)
-- Name: subjectteachers_form_3 subjectteachers_form_3_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjectteachers_form_3
    ADD CONSTRAINT subjectteachers_form_3_pkey PRIMARY KEY (id);


--
-- TOC entry 5730 (class 2606 OID 49873)
-- Name: subjectteachers_form_3 subjectteachers_form_3_unival_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjectteachers_form_3
    ADD CONSTRAINT subjectteachers_form_3_unival_key UNIQUE (unival);


--
-- TOC entry 5732 (class 2606 OID 49890)
-- Name: subjectteachers_form_4 subjectteachers_form_4_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjectteachers_form_4
    ADD CONSTRAINT subjectteachers_form_4_pkey PRIMARY KEY (id);


--
-- TOC entry 5734 (class 2606 OID 49892)
-- Name: subjectteachers_form_4 subjectteachers_form_4_unival_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjectteachers_form_4
    ADD CONSTRAINT subjectteachers_form_4_unival_key UNIQUE (unival);


--
-- TOC entry 5694 (class 2606 OID 41668)
-- Name: staff unique_staff_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT unique_staff_email UNIQUE (email);


--
-- TOC entry 5738 (class 2606 OID 58025)
-- Name: smslogs unique_student_unival; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.smslogs
    ADD CONSTRAINT unique_student_unival UNIQUE (student_unival);


--
-- TOC entry 5740 (class 2606 OID 58035)
-- Name: uploaded_images uploaded_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uploaded_images
    ADD CONSTRAINT uploaded_images_pkey PRIMARY KEY (id);


--
-- TOC entry 5772 (class 2606 OID 59837)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5774 (class 2606 OID 59839)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5777 (class 1259 OID 59865)
-- Name: idx_revoked_tokens_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_revoked_tokens_expires ON public.revoked_tokens USING btree (expires_at);


--
-- TOC entry 5803 (class 2606 OID 59664)
-- Name: end_term_1_form_1_2025 end_term_1_form_1_2025_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.end_term_1_form_1_2025
    ADD CONSTRAINT end_term_1_form_1_2025_id_fkey FOREIGN KEY (id) REFERENCES public.students_form_1(id) ON DELETE CASCADE;


--
-- TOC entry 5809 (class 2606 OID 59802)
-- Name: end_term_1_form_1_2025_paper_setup end_term_1_form_1_2025_paper_setup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.end_term_1_form_1_2025_paper_setup
    ADD CONSTRAINT end_term_1_form_1_2025_paper_setup_id_fkey FOREIGN KEY (id) REFERENCES public.subjects_form_1(id) ON DELETE CASCADE;


--
-- TOC entry 5781 (class 2606 OID 34675)
-- Name: end_term_1_form_4_2025 end_term_1_form_4_2025_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.end_term_1_form_4_2025
    ADD CONSTRAINT end_term_1_form_4_2025_id_fkey FOREIGN KEY (id) REFERENCES public.students_form_4(id) ON DELETE CASCADE;


--
-- TOC entry 5785 (class 2606 OID 34767)
-- Name: end_term_1_form_4_2025_paper_setup end_term_1_form_4_2025_paper_setup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.end_term_1_form_4_2025_paper_setup
    ADD CONSTRAINT end_term_1_form_4_2025_paper_setup_id_fkey FOREIGN KEY (id) REFERENCES public.subjects_form_4(id) ON DELETE CASCADE;


--
-- TOC entry 5788 (class 2606 OID 41848)
-- Name: form_1_streams form_1_streams_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_1_streams
    ADD CONSTRAINT form_1_streams_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- TOC entry 5789 (class 2606 OID 41864)
-- Name: form_2_streams form_2_streams_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_2_streams
    ADD CONSTRAINT form_2_streams_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- TOC entry 5790 (class 2606 OID 41879)
-- Name: form_3_streams form_3_streams_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_3_streams
    ADD CONSTRAINT form_3_streams_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- TOC entry 5791 (class 2606 OID 41894)
-- Name: form_4_streams form_4_streams_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_4_streams
    ADD CONSTRAINT form_4_streams_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- TOC entry 5806 (class 2606 OID 59766)
-- Name: grading_end_term_1_form_1_2025 grading_end_term_1_form_1_2025_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grading_end_term_1_form_1_2025
    ADD CONSTRAINT grading_end_term_1_form_1_2025_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects_form_1(id) ON DELETE CASCADE;


--
-- TOC entry 5783 (class 2606 OID 34743)
-- Name: grading_end_term_1_form_4_2025 grading_end_term_1_form_4_2025_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grading_end_term_1_form_4_2025
    ADD CONSTRAINT grading_end_term_1_form_4_2025_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects_form_4(id) ON DELETE CASCADE;


--
-- TOC entry 5805 (class 2606 OID 59732)
-- Name: grading_mid_term_1_form_1_2025 grading_mid_term_1_form_1_2025_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grading_mid_term_1_form_1_2025
    ADD CONSTRAINT grading_mid_term_1_form_1_2025_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects_form_1(id) ON DELETE CASCADE;


--
-- TOC entry 5782 (class 2606 OID 34709)
-- Name: grading_mid_term_1_form_4_2025 grading_mid_term_1_form_4_2025_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grading_mid_term_1_form_4_2025
    ADD CONSTRAINT grading_mid_term_1_form_4_2025_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects_form_4(id) ON DELETE CASCADE;


--
-- TOC entry 5804 (class 2606 OID 59698)
-- Name: grading_opener_term_1_form_1_2025 grading_opener_term_1_form_1_2025_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grading_opener_term_1_form_1_2025
    ADD CONSTRAINT grading_opener_term_1_form_1_2025_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects_form_1(id) ON DELETE CASCADE;


--
-- TOC entry 5802 (class 2606 OID 59534)
-- Name: mid_term_1_form_1_2025 mid_term_1_form_1_2025_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mid_term_1_form_1_2025
    ADD CONSTRAINT mid_term_1_form_1_2025_id_fkey FOREIGN KEY (id) REFERENCES public.students_form_1(id) ON DELETE CASCADE;


--
-- TOC entry 5808 (class 2606 OID 59790)
-- Name: mid_term_1_form_1_2025_paper_setup mid_term_1_form_1_2025_paper_setup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mid_term_1_form_1_2025_paper_setup
    ADD CONSTRAINT mid_term_1_form_1_2025_paper_setup_id_fkey FOREIGN KEY (id) REFERENCES public.subjects_form_1(id) ON DELETE CASCADE;


--
-- TOC entry 5780 (class 2606 OID 34545)
-- Name: mid_term_1_form_4_2025 mid_term_1_form_4_2025_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mid_term_1_form_4_2025
    ADD CONSTRAINT mid_term_1_form_4_2025_id_fkey FOREIGN KEY (id) REFERENCES public.students_form_4(id) ON DELETE CASCADE;


--
-- TOC entry 5784 (class 2606 OID 34755)
-- Name: mid_term_1_form_4_2025_paper_setup mid_term_1_form_4_2025_paper_setup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mid_term_1_form_4_2025_paper_setup
    ADD CONSTRAINT mid_term_1_form_4_2025_paper_setup_id_fkey FOREIGN KEY (id) REFERENCES public.subjects_form_4(id) ON DELETE CASCADE;


--
-- TOC entry 5801 (class 2606 OID 59404)
-- Name: opener_term_1_form_1_2025 opener_term_1_form_1_2025_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opener_term_1_form_1_2025
    ADD CONSTRAINT opener_term_1_form_1_2025_id_fkey FOREIGN KEY (id) REFERENCES public.students_form_1(id) ON DELETE CASCADE;


--
-- TOC entry 5807 (class 2606 OID 59778)
-- Name: opener_term_1_form_1_2025_paper_setup opener_term_1_form_1_2025_paper_setup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opener_term_1_form_1_2025_paper_setup
    ADD CONSTRAINT opener_term_1_form_1_2025_paper_setup_id_fkey FOREIGN KEY (id) REFERENCES public.subjects_form_1(id) ON DELETE CASCADE;


--
-- TOC entry 5810 (class 2606 OID 59849)
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5811 (class 2606 OID 59860)
-- Name: revoked_tokens revoked_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revoked_tokens
    ADD CONSTRAINT revoked_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5798 (class 2606 OID 58052)
-- Name: staff_images staff_images_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_images
    ADD CONSTRAINT staff_images_id_fkey FOREIGN KEY (id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- TOC entry 5800 (class 2606 OID 58670)
-- Name: student_form_1_images student_form_1_images_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_form_1_images
    ADD CONSTRAINT student_form_1_images_id_fkey FOREIGN KEY (id) REFERENCES public.students_form_1(id) ON DELETE CASCADE;


--
-- TOC entry 5799 (class 2606 OID 58104)
-- Name: students students_stream_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_stream_id_fkey FOREIGN KEY (stream_id) REFERENCES public.streams(id) ON DELETE SET NULL;


--
-- TOC entry 5786 (class 2606 OID 41688)
-- Name: subjectteachers_form_1 subjectteachers_form_1_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjectteachers_form_1
    ADD CONSTRAINT subjectteachers_form_1_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects_form_1(id) ON DELETE CASCADE;


--
-- TOC entry 5787 (class 2606 OID 41683)
-- Name: subjectteachers_form_1 subjectteachers_form_1_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjectteachers_form_1
    ADD CONSTRAINT subjectteachers_form_1_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- TOC entry 5792 (class 2606 OID 49860)
-- Name: subjectteachers_form_2 subjectteachers_form_2_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjectteachers_form_2
    ADD CONSTRAINT subjectteachers_form_2_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects_form_2(id) ON DELETE CASCADE;


--
-- TOC entry 5793 (class 2606 OID 49855)
-- Name: subjectteachers_form_2 subjectteachers_form_2_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjectteachers_form_2
    ADD CONSTRAINT subjectteachers_form_2_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- TOC entry 5794 (class 2606 OID 49879)
-- Name: subjectteachers_form_3 subjectteachers_form_3_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjectteachers_form_3
    ADD CONSTRAINT subjectteachers_form_3_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects_form_3(id) ON DELETE CASCADE;


--
-- TOC entry 5795 (class 2606 OID 49874)
-- Name: subjectteachers_form_3 subjectteachers_form_3_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjectteachers_form_3
    ADD CONSTRAINT subjectteachers_form_3_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- TOC entry 5796 (class 2606 OID 49898)
-- Name: subjectteachers_form_4 subjectteachers_form_4_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjectteachers_form_4
    ADD CONSTRAINT subjectteachers_form_4_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects_form_4(id) ON DELETE CASCADE;


--
-- TOC entry 5797 (class 2606 OID 49893)
-- Name: subjectteachers_form_4 subjectteachers_form_4_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjectteachers_form_4
    ADD CONSTRAINT subjectteachers_form_4_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.staff(id) ON DELETE CASCADE;


-- Completed on 2025-05-11 11:39:13

--
-- PostgreSQL database dump complete
--

