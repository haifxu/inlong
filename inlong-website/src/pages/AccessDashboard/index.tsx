/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useState } from 'react';
import { Button, Card, Modal, message } from 'antd';
import { PageContainer, Container } from '@/components/PageContainer';
import HighTable from '@/components/HighTable';
import { DashboardCardList } from '@/components/DashboardCard';
import request from '@/utils/request';
import { useTranslation } from 'react-i18next';
import { useRequest, useHistory } from '@/hooks';
import { defaultSize } from '@/configs/pagination';
import ExecutionLogModal from './ExecutionLogModal';
import { dashCardList, getFilterFormContent, getColumns } from './config';

const Comp: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [options, setOptions] = useState({
    // keyWord: '',
    // status: '',
    pageSize: defaultSize,
    pageNum: 1,
  });

  const [executionLogModal, setExecutionLogModal] = useState({
    visible: false,
    businessIdentifier: '',
  });

  const { data: summary = {} } = useRequest({
    url: '/business/countByStatus',
  });

  const { data, loading, run: getList } = useRequest(
    {
      url: '/business/list',
      params: options,
    },
    {
      refreshDeps: [options],
    },
  );

  const onDelete = ({ businessIdentifier }) => {
    Modal.confirm({
      title: t('pages.AccessDashboard.ConfirmDelete'),
      onOk: async () => {
        await request({
          url: `/business/delete/${businessIdentifier}`,
          method: 'DELETE',
        });
        await getList();
        message.success(t('pages.AccessDashboard.SuccessfullyDeleted'));
      },
    });
  };

  const openModal = ({ businessIdentifier }) => {
    setExecutionLogModal({ visible: true, businessIdentifier: businessIdentifier });
  };

  const onChange = ({ current: pageNum, pageSize }) => {
    setOptions(prev => ({
      ...prev,
      pageNum,
      pageSize,
    }));
  };

  const onFilter = allValues => {
    setOptions(prev => ({
      ...prev,
      ...allValues,
      pageNum: 1,
    }));
  };

  const pagination = {
    pageSize: options.pageSize,
    current: options.pageNum,
    total: data?.total,
  };

  const dashboardList = dashCardList.map(item => ({
    ...item,
    title: summary[item.dataIndex] || 0,
  }));

  return (
    <PageContainer useDefaultBreadcrumb={false} useDefaultContainer={false}>
      <Container>
        <DashboardCardList dataSource={dashboardList} />
      </Container>

      <Container>
        <Card>
          <HighTable
            suffix={
              <Button type="primary" onClick={() => history.push('/access/create')}>
                {t('pages.AccessDashboard.NewAccess')}
              </Button>
            }
            filterForm={{
              content: getFilterFormContent(options),
              onFilter,
            }}
            table={{
              columns: getColumns({ onDelete, openModal }),
              rowKey: 'id',
              dataSource: data?.list,
              pagination,
              loading,
              onChange,
            }}
          />
        </Card>
      </Container>

      <ExecutionLogModal
        {...executionLogModal}
        onOk={() => setExecutionLogModal({ visible: false, businessIdentifier: '' })}
        onCancel={() => setExecutionLogModal({ visible: false, businessIdentifier: '' })}
      />
    </PageContainer>
  );
};

export default Comp;
