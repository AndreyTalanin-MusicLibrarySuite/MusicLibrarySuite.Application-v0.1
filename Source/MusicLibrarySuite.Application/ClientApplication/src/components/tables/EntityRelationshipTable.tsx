import { Button, Space, Table, Typography } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useCallback, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import styles from "./EntityRelationshipTable.module.css";
import "antd/dist/antd.min.css";

const draggableHTMLTableRowElementType = "DraggableHTMLTableRowElement";

interface DraggableHTMLTableRowElementProps extends React.HTMLAttributes<HTMLTableRowElement> {
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
}

const DraggableHTMLTableRowElement = ({ index, moveRow, className, style, ...restProps }: DraggableHTMLTableRowElementProps) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: draggableHTMLTableRowElementType,
    collect: (monitor) => {
      const { index: dragIndex } = monitor.getItem() || {};
      if (dragIndex === index) {
        return {};
      } else {
        return {
          isOver: monitor.isOver(),
          dropClassName: ` ${styles.dropOver}`,
        };
      }
    },
    drop: (item: { index: number }) => {
      moveRow(item.index, index);
    },
  });

  const [, drag] = useDrag({
    type: draggableHTMLTableRowElementType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drop(drag(ref));

  return <tr ref={ref} className={`${className}${isOver ? dropClassName : ""}`} style={{ cursor: "move", ...style }} {...restProps} />;
};

export interface EntityRelationship {
  name: string;
  description?: string;
  entityId: string;
  entityName: string;
  entityHref?: string;
  dependentEntityId: string;
  dependentEntityName: string;
  dependentEntityHref?: string;
}

export interface EntityRelationshipTableProps {
  entityColumnName: string;
  dependentEntityColumnName: string;
  entityRelationships: EntityRelationship[];
  loading?: boolean;
  editMode?: boolean;
  onEntityRelationshipEdit?: (entityRelationship: EntityRelationship) => void;
  onEntityRelationshipDelete?: (entityRelationship: EntityRelationship) => void;
  onEntityRelationshipsChange?: (entityRelationships: EntityRelationship[]) => void;
}

const EntityRelationshipTable = ({
  entityColumnName,
  dependentEntityColumnName,
  entityRelationships,
  loading,
  editMode,
  onEntityRelationshipEdit,
  onEntityRelationshipDelete,
  onEntityRelationshipsChange,
}: EntityRelationshipTableProps) => {
  const columns = [
    {
      key: "entityName",
      title: entityColumnName,
      dataIndex: "entityName",
      render: (value: string, { entityHref }: EntityRelationship) => (entityHref ? <Typography.Link href={entityHref}>{value}</Typography.Link> : value),
    },
    {
      key: "dependentEntityName",
      title: dependentEntityColumnName,
      dataIndex: "dependentEntityName",
      render: (value: string, { dependentEntityHref }: EntityRelationship) =>
        dependentEntityHref ? <Typography.Link href={dependentEntityHref}>{value}</Typography.Link> : value,
    },
    {
      key: "name",
      title: "Relationship Name",
      dataIndex: "name",
    },
    {
      key: "description",
      title: "Relationship Description",
      dataIndex: "description",
    },
  ];

  const editModeColumns = [
    ...columns,
    {
      key: "action",
      title: "Action",
      render: (_: string, entityRelationship: EntityRelationship) => (
        <Space wrap>
          <Button onClick={onEntityRelationshipEdit ? () => onEntityRelationshipEdit(entityRelationship) : undefined}>
            <EditOutlined /> Edit
          </Button>
          <Button danger onClick={onEntityRelationshipDelete ? () => onEntityRelationshipDelete(entityRelationship) : undefined}>
            <DeleteOutlined /> Delete
          </Button>
        </Space>
      ),
    },
  ];

  const components = {
    body: {
      row: DraggableHTMLTableRowElement,
    },
  };

  const getEntityRelationshipKey = ({ entityId, dependentEntityId }: EntityRelationship) => {
    return `(${entityId}, ${dependentEntityId})`;
  };

  const moveRow = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      if (onEntityRelationshipsChange) {
        const row = entityRelationships[dragIndex];
        const newEntityRelationships = [...entityRelationships];
        newEntityRelationships.splice(dragIndex, 1);
        newEntityRelationships.splice(hoverIndex, 0, row);
        onEntityRelationshipsChange(newEntityRelationships);
      }
    },
    [entityRelationships, onEntityRelationshipsChange]
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <Table
        size="small"
        columns={editMode ? editModeColumns : columns}
        components={editMode ? components : undefined}
        pagination={editMode ? { showSizeChanger: true } : undefined}
        loading={loading}
        dataSource={entityRelationships}
        rowKey={getEntityRelationshipKey}
        onRow={editMode ? (_, index) => ({ index, moveRow } as React.HTMLAttributes<any>) : undefined}
      />
    </DndProvider>
  );
};

export default EntityRelationshipTable;
