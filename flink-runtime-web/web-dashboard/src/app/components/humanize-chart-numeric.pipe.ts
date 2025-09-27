/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Pipe, PipeTransform } from '@angular/core';

import { isNil } from '@flink-runtime-web/utils';

import { HumanizeBytesPipe } from './humanize-bytes.pipe';
import { HumanizeDurationPipe } from './humanize-duration.pipe';

@Pipe({ name: 'humanizeChartNumeric' })
export class HumanizeChartNumericPipe implements PipeTransform {
  transform(value: number, id: string): string {
    if (isNil(value)) return '-';

    const metricId = (id ?? '').toLowerCase();
    const containsTimerState = metricId.includes('timer_state');

    const isPerSecond =
      /persecond/.test(metricId) || /\bper\s*second\b/.test(metricId);

    const isBytes =
      /bytes?/.test(metricId) ||
      /rocksdb_.*-sst-files-size/.test(metricId) ||
      /(?:[_-])size\b/.test(metricId);

    const hasLatencyOrDuration = /latency|duration/.test(metricId);
    const hasWordTimeEnd = /time\b/.test(metricId) && !containsTimerState;
    const tokenWithUnit =
      /(time|latency|duration)(?:ms|millis|milliseconds|s|sec|seconds|us|micros|microseconds|ns|nanos|nanoseconds)(?:[_-](?:max|min|avg|mean|median|p\d+))?\b/.test(
        metricId
      );

    const isDuration = hasLatencyOrDuration || hasWordTimeEnd || tokenWithUnit;

    if (isBytes && isPerSecond) {
      return `${new HumanizeBytesPipe().transform(value)} / s`;
    }
    if (isBytes) {
      return new HumanizeBytesPipe().transform(value);
    }
    if (isPerSecond) {
      return `${value} / s`;
    }
    if (isDuration) {
      return new HumanizeDurationPipe().transform(value, true);
    }
    return `${value}`;
  }
}
