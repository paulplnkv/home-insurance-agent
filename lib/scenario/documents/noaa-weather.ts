import {
  CLAIM,
  dateOffsetFromLoss,
  timestampOffsetFromLoss,
} from '../claim';

// NOAA returned the nearest qualifying hail event 3 days before the
// reported date of loss — this delta drives the cross-doc finding.
const NEAREST_EVENT_OFFSET_DAYS = -3;
const NOAA_QUERIED_AT_OFFSET_DAYS = 5;
const LOSS_DATE = CLAIM.loss.date_of_loss;
const NEAREST_EVENT_DATE = dateOffsetFromLoss(NEAREST_EVENT_OFFSET_DAYS);
const QUERIED_AT_UTC =
  timestampOffsetFromLoss(NOAA_QUERIED_AT_OFFSET_DAYS, '14:02:11').replace(
    /-05:00$/,
    'Z',
  );
const LOSS_YEAR_MONTH = LOSS_DATE.slice(0, 7);

const noaaWeather = {
  id: 'noaa-weather',
  kind: 'weather_verification',
  title: 'NOAA Weather Verification — Storm Events Database Query',
  filename: `NOAA_StormEvents_75024_${LOSS_YEAR_MONTH}.json`,
  metadata: {
    data_source:
      'NOAA NCEI Storm Events Database (synthetic facsimile for claim verification)',
    query_zip: '75024',
    query_radius_miles: 5,
    query_date_range: {
      from: dateOffsetFromLoss(-7),
      to: dateOffsetFromLoss(3),
    },
    query_perils: ['Hail'],
    queried_at: QUERIED_AT_UTC,
    operator: 'Maria Wells (Adjuster)',
  },
  events: [
    {
      event_id: 'STM-NCEI-2026-TX-001942',
      event_type: 'Hail',
      begin_date_local: NEAREST_EVENT_DATE,
      begin_time_local: '16:42 CDT',
      end_time_local: '17:11 CDT',
      max_hail_size_inches: 1.5,
      narrative:
        'Severe thunderstorm produced hail to 1.5 inches diameter across northern Plano, including ZIP 75024. Multiple reports of vehicle and roof damage in the Oak Ridge / Custer Ridge corridor. Public reports submitted via Skywarn between 16:48 and 17:30 CDT.',
      verified_zip_within_radius: ['75024', '75025', '75093'],
    },
  ],
  queried_date_of_loss: LOSS_DATE,
  events_on_queried_date_of_loss: [] as unknown[],
  match_summary: {
    qualifying_event_on_reported_date: false,
    nearest_qualifying_event: {
      event_id: 'STM-NCEI-2026-TX-001942',
      date: NEAREST_EVENT_DATE,
      delta_days_from_reported_loss: 3,
      max_hail_size_inches: 1.5,
    },
    notes: `No qualifying hail event recorded in ZIP 75024 (or within 5 mi) on ${LOSS_DATE}, the reported date of loss. The nearest qualifying hail event was ${NEAREST_EVENT_DATE}, three days earlier. Recommend confirming date of loss with insured before proceeding with coverage determination.`,
  },
} as const;

export default noaaWeather;
